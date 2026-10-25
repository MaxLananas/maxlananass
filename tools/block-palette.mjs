// Computes the average colour of every bundled block texture -> palette.json
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
const dir = resolve(import.meta.dirname, "../assets/blocks");
const files = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort();
const out = [];
for (const f of files) {
  const { data, info } = await sharp(resolve(dir, f)).raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = info.channels === 4 ? data[i + 3] : 255;
    if (a < 128) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
  }
  if (!n) continue;
  out.push({ n: f.replace(/\.png$/, "").replace(/_/g, " "), f, r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) });
}
await writeFile(resolve(dir, "palette.json"), JSON.stringify(out));
console.log("palette entries:", out.length);
