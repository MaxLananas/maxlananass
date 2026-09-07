import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import wawoff2 from "wawoff2";

const logos = {
  bte: "Logo_BTE_France-3632312792.png",
  endorah: "cropped-500x500Endorah_-_Copie-2322200814.png",
  fight4glory: "image_v2-Photoroom.png",
  mrbeast: "1701523229mr-beast-logo-transparent-background-2847774365.png"
};

export async function prepareStatic(root = process.cwd()) {
  await mkdir(resolve(root, "assets/fonts"), { recursive: true });
  await mkdir(resolve(root, "assets/credits"), { recursive: true });
  const font = await readFile(resolve(root, "FFFlauta-200.otf"));
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
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await prepareStatic(), null, 2));
}
