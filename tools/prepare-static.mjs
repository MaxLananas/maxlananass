import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import wawoff2 from "wawoff2";
import { prepareSeoAssets } from "./seo-assets.mjs";

const logos = {
  bte: "sources/Logo_BTE_France-3632312792.png",
  endorah: "sources/cropped-500x500Endorah_-_Copie-2322200814.png",
  fight4glory: "sources/image_v2-Photoroom.png",
  mrbeast: "sources/1701523229mr-beast-logo-transparent-background-2847774365.png"
};

const ICON_SIZES = [16, 32, 48];

async function writeFavicon(root) {
  const icon = await readFile(resolve(root, "apple-touch-icon.png"));
  const frames = await Promise.all(ICON_SIZES.map((size) => sharp(icon).resize(size, size, { kernel: "nearest" }).png({ compressionLevel: 9 }).toBuffer()));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length + 16 * frames.length;
  const entries = frames.map((frame, index) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(ICON_SIZES[index], 0);
    entry.writeUInt8(ICON_SIZES[index], 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(frame.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += frame.length;
    return entry;
  });
  await writeFile(resolve(root, "favicon.ico"), Buffer.concat([header, ...entries, ...frames]));
  return offset;
}

export async function prepareStatic(root = process.cwd()) {
  await mkdir(resolve(root, "assets/fonts"), { recursive: true });
  await mkdir(resolve(root, "assets/credits"), { recursive: true });
  const font = await readFile(resolve(root, "sources/FFFlauta-200.otf"));
  const compressed = await wawoff2.compress(font);
  await writeFile(resolve(root, "assets/fonts/FFFlauta-200.woff2"), Buffer.from(compressed));
  const result = { font: { original: font.length, optimized: compressed.length }, logos: {} };
  for (const [key, source] of Object.entries(logos)) {
    const input = await readFile(resolve(root, source));
    const output = await sharp(input).rotate().resize({ width: 64, height: 64, fit: "inside", withoutEnlargement: true })
      .webp({ lossless: true, effort: 6 }).toBuffer();
    await writeFile(resolve(root, `assets/credits/${key}.webp`), output);
    result.logos[key] = { original: input.length, optimized: output.length };
  }
  await prepareSeoAssets(root);
  result.favicon = { bytes: await writeFavicon(root), sizes: ICON_SIZES };
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await prepareStatic(), null, 2));
}
