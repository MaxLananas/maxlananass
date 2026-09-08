// Reproducible, same-pixel-width comparison, not a made-up page-speed score.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { RECIPE } from "./prepare-images.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node tools/measure-image.mjs /path/to/an/original.png");
  process.exitCode = 1;
} else {
  const original = await readFile(file);
  const rows = [];
  sharp.concurrency(1);
  for (const width of [320, 640]) {
    const image = sharp(original).rotate().toColourspace("srgb").resize({ width, withoutEnlargement: true, kernel: RECIPE.kernel });
    const png = await image.clone().png({ compressionLevel: 6, adaptiveFiltering: false }).toBuffer();
    const webp = await image.clone().webp(RECIPE.webp).toBuffer();
    const avif = await image.clone().avif(RECIPE.avif).toBuffer();
    rows.push({ width, pngBytes: png.length, webpBytes: webp.length, avifBytes: avif.length,
      webpReduction: Number((100 * (1 - webp.length / png.length)).toFixed(1)),
      avifReduction: Number((100 * (1 - avif.length / png.length)).toFixed(1)) });
  }
  const report = { file: basename(file), sha256: createHash("sha256").update(original).digest("hex"), originalBytes: original.length, recipe: RECIPE, rows };
  await mkdir(".cache", { recursive: true });
  await writeFile(".cache/image-measurement.json", JSON.stringify(report, null, 2));
  console.table(rows);
  console.log("Detailed report: .cache/image-measurement.json. Originals are unchanged; modern variants use high-quality lossy encoding.");
}
