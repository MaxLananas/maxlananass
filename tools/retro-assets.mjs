// Generates the tiny pixel assets of the retro frontend (tiled backgrounds,
// custom cursors, animated GIF dividers) with zero dependencies:
// a minimal PNG (RGBA, zlib) and GIF89a (uncompressed-LZW trick) encoder.
import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const out = resolve(import.meta.dirname, "../assets/retro");

/* ------------------------------------------------------------------ PNG -- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();
const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function png(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
class Canvas {
  constructor(width, height, fill = [0, 0, 0, 0]) {
    this.width = width;
    this.height = height;
    this.px = Buffer.alloc(width * height * 4);
    for (let i = 0; i < width * height; i++) this.set(i % width, (i / width) | 0, fill);
  }
  set(x, y, [r, g, b, a = 255]) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const o = (y * this.width + x) * 4;
    this.px[o] = r; this.px[o + 1] = g; this.px[o + 2] = b; this.px[o + 3] = a;
  }
  get(x, y) {
    const o = (y * this.width + x) * 4;
    return [this.px[o], this.px[o + 1], this.px[o + 2], this.px[o + 3]];
  }
  scale(factor) {
    const big = new Canvas(this.width * factor, this.height * factor);
    for (let y = 0; y < big.height; y++)
      for (let x = 0; x < big.width; x++)
        big.set(x, y, this.get((x / factor) | 0, (y / factor) | 0));
    return big;
  }
  buffer() { return png(this.width, this.height, this.px); }
}
const fromRows = (rows, map) => {
  const c = new Canvas(rows[0].length, rows.length);
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (map[ch]) c.set(x, y, map[ch]); }));
  return c;
};

/* ------------------------------------------------------------------ GIF -- */
// GIF89a, 256-colour global palette, "uncompressed" LZW: a CLEAR code every
// 254 literals keeps the code width constant at 9 bits. Valid and tiny.
class BitWriter {
  constructor() { this.bytes = []; this.acc = 0; this.n = 0; }
  write(code, width) {
    this.acc |= code << this.n;
    this.n += width;
    while (this.n >= 8) { this.bytes.push(this.acc & 0xff); this.acc >>= 8; this.n -= 8; }
  }
  flush() { if (this.n > 0) { this.bytes.push(this.acc & 0xff); this.acc = 0; this.n = 0; } }
}
function gif(width, height, palette, frames) {
  const buf = [];
  const push = (...b) => buf.push(...b);
  const str = (s) => [...s].forEach((ch) => push(ch.charCodeAt(0)));
  const word = (v) => push(v & 0xff, (v >> 8) & 0xff);
  str("GIF89a");
  word(width); word(height);
  push(0xf7, 0, 0); // GCT 256 entries, 8 bits
  for (let i = 0; i < 256; i++) {
    const c = palette[i] || [0, 0, 0];
    push(c[0], c[1], c[2]);
  }
  push(0x21, 0xff, 0x0b); str("NETSCAPE2.0"); push(3, 1, 0, 0, 0); // loop forever
  for (const frame of frames) {
    push(0x21, 0xf9, 4, frame.transparent ? 0x09 : 0x04, frame.delay & 0xff, (frame.delay >> 8) & 0xff, frame.transparent || 0, 0);
    push(0x2c); word(0); word(0); word(width); word(height); push(0);
    const min = 8;
    push(min);
    const bw = new BitWriter();
    const CLEAR = 256, EOI = 257, CHUNK = 254;
    let i = 0;
    bw.write(CLEAR, 9);
    let since = 0;
    while (i < frame.index.length) {
      bw.write(frame.index[i++], 9);
      if (++since === CHUNK && i < frame.index.length) { bw.write(CLEAR, 9); since = 0; }
    }
    bw.write(EOI, 9);
    bw.flush();
    const bytes = bw.bytes;
    for (let p = 0; p < bytes.length; p += 255) {
      const block = bytes.slice(p, p + 255);
      push(block.length, ...block);
    }
    push(0);
  }
  push(0x3b);
  return Buffer.from(buf);
}
const indexedCanvas = (width, height, painter, palette) => {
  const index = new Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) index[y * width + x] = painter(x, y);
  return { index, palette };
};

/* --------------------------------------------------------------- assets -- */
await mkdir(out, { recursive: true });
const write = async (name, data) => { await writeFile(resolve(out, name), data); console.log("assets/retro/" + name, data.length, "bytes"); };

// Tiled page background: warm grey paper with a tiny diamond motif.
const tile = new Canvas(16, 16, [214, 210, 202, 255]);
const diamond = [[8, 6], [7, 7], [9, 7], [8, 8], [7, 9], [9, 9], [8, 10]];
diamond.forEach(([x, y]) => tile.set(x, y, [196, 191, 180, 255]));
tile.set(8, 7, [226, 223, 216, 255]);
tile.set(8, 9, [182, 177, 165, 255]);
[[2, 2], [3, 2], [2, 3]].forEach(([x, y]) => tile.set(x, y, [206, 202, 193, 255]));
[[13, 12], [14, 12], [13, 13]].forEach(([x, y]) => tile.set(x, y, [222, 219, 212, 255]));
await write("bg-tile.png", tile.buffer());

// Darker tile for the outer page margin (used behind the framed table).
const tileDark = new Canvas(16, 16, [122, 118, 110, 255]);
[[0, 0], [8, 8]].forEach(([x, y]) => tileDark.set(x, y, [112, 108, 100, 255]));
[[4, 12], [12, 4]].forEach(([x, y]) => tileDark.set(x, y, [132, 128, 120, 255]));
await write("bg-tile-dark.png", tileDark.buffer());

// Classic arrow cursor, drawn 16x16 then doubled for crispness.
const arrow = fromRows([
  "X...............",
  "XX..............",
  "XWX.............",
  "XWWX............",
  "XWWWX...........",
  "XWWWWX..........",
  "XWWWWWX.........",
  "XWWWWWWX........",
  "XWWWWWWWX.......",
  "XWWWWWWWWX......",
  "XWWWWWWWWWX.....",
  "XWWWWWWWWWWWX...",
  "XWWWWWWWWWWWX...",
  "XWWWWWXXWWWWX...",
  "XWWWX..XWWWWX...",
  "XWWX....XWWX....",
  "XXX......XX....."
], { X: [0, 0, 0, 255], W: [255, 255, 255, 255] });
await write("cursor.png", arrow.scale(2).buffer());

// Pixel pointing hand for links.
const hand = fromRows([
  "................",
  ".....XX.........",
  "....XWWX........",
  "....XWWX........",
  "....XWWX........",
  "....XWWX........",
  "X...XWWX........",
  "XX..XWWX........",
  "XWX.XWWX........",
  "XWWXWWWX........",
  "XWWWWWWX........",
  "XWWWWWWX........",
  ".XWWWWX.........",
  ".XWWWWX.........",
  "..XXXX..........",
  "................"
], { X: [0, 0, 0, 255], W: [255, 255, 255, 255] });
await write("cursor-link.png", hand.scale(2).buffer());

// Pixel text-cursor (I-beam) for inputs.
const ibeam = fromRows([
  "................",
  "....XXXXXX......",
  "....X....X......",
  "......XX........",
  "......XX........",
  "......XX........",
  "......XX........",
  "......XX........",
  "......XX........",
  "......XX........",
  "....X....X......",
  "....XXXXXX......",
  "................",
  "................",
  "................",
  "................"
], { X: [0, 0, 0, 255] });
await write("cursor-text.png", ibeam.scale(2).buffer());

// Animated rainbow horizontal rule (scrolling colour bands).
const RAINBOW = [[255, 0, 0], [255, 128, 0], [255, 255, 0], [0, 200, 0], [0, 220, 220], [0, 80, 255], [200, 0, 220], [120, 120, 120]];
{
  const width = 432, height = 8;
  const frames = [];
  for (let f = 0; f < 8; f++) {
    const { index } = indexedCanvas(width, height, (x, y) => (y + f) % 8, RAINBOW);
    frames.push({ index, delay: 9, transparent: 0 });
  }
  await write("rainbow-hr.gif", gif(width, height, RAINBOW, frames));
}

// Animated "under construction" barber pole (88x31, like a classic blinkie).
{
  const width = 88, height = 31;
  const pal = [[0, 0, 0], [255, 204, 0], [128, 128, 128], [255, 255, 255]];
  const frames = [];
  for (let f = 0; f < 8; f++) {
    const { index } = indexedCanvas(width, height, (x, y) => {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return 2;
      if (x === 1 || y === 1 || x === width - 2 || y === height - 2) return 0;
      const band = ((x + y + f * 2) % 16);
      return band < 8 ? 1 : 0;
    }, pal);
    frames.push({ index, delay: 8, transparent: 0 });
  }
  await write("construction.gif", gif(width, height, pal, frames));
}

// Spinning pixel star blinkie (transparent background).
{
  const size = 21;
  const pal = [[0, 0, 0], [255, 240, 80], [255, 170, 0], [255, 255, 255]];
  const star = (x, y, phase) => {
    const cx = (size - 1) / 2, cy = (size - 1) / 2;
    const dx = x - cx, dy = y - cy;
    const angle = Math.atan2(dy, dx) + phase;
    const radius = Math.hypot(dx, dy);
    const spike = 4.5 + 5.5 * Math.abs(Math.cos(angle * 2.5));
    if (radius > spike) return 0;
    if (radius < 2.2) return 3;
    return radius < spike - 2 ? 1 : 2;
  };
  const frames = [];
  for (let f = 0; f < 8; f++) {
    const { index } = indexedCanvas(size, size, (x, y) => star(x, y, (f * Math.PI) / 4), pal);
    frames.push({ index, delay: 9, transparent: 0 });
  }
  await write("star.gif", gif(size, size, pal, frames));
}

// Little pixel heart blinkie (beating).
{
  const width = 17, height = 15;
  const pal = [[0, 0, 0], [220, 30, 60], [255, 120, 140], [255, 255, 255]];
  const heartRows = [
    ".XX...XX.",
    "XhhX.XhhX",
    "XhhhXhhhX",
    "XhhhhhhhX",
    ".XhhhhhX.",
    "..XhhhX..",
    "...XhX...",
    "....X...."
  ];
  const frames = [];
  for (let beat = 0; beat < 2; beat++) {
    const pad = beat ? 1 : 0;
    const { index } = indexedCanvas(width, height, (x, y) => {
      const row = heartRows[Math.floor((y - 2 - pad) * (8 / (8 + pad)))];
      if (!row) return 0;
      const ch = row[Math.floor((x - 4 + pad / 2) * (9 / (9 - pad)))];
      if (ch === "X") return 1;
      if (ch === "h") return x < 6 && y < 6 ? 2 : 1;
      return 0;
    }, pal);
    frames.push({ index, delay: beat ? 12 : 30, transparent: 0 });
  }
  await write("heart.gif", gif(width, height, pal, frames));
}

console.log("retro assets done");
