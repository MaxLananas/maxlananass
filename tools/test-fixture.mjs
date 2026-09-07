// Synthetic, deterministic test images ONLY. Never deployed or mixed into the
// portfolio. All fixture output lives in ignored .cache/ directories.
import { mkdir, writeFile, copyFile, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { FILES } from "../gallery-data.js";
import { RECIPE } from "./prepare-images.mjs";
import { buildSite } from "./build.mjs";
import { renderSeo } from "./seo-render.mjs";

export async function createFixture() {
  const directory = resolve(".cache/test-originals");
  await mkdir(directory, { recursive: true });
  const sizes = [[1280, 720], [640, 960], [768, 768], [1600, 600]];
  const images = [];
  for (const [i, [width, height]] of sizes.entries()) {
    const blocks = Array.from({ length: 35 }, (_, j) => `<rect x="${(j % 7) * width / 7}" y="${Math.floor(j / 7) * height / 5}" width="${width / 7}" height="${height / 5}" fill="hsl(${(i * 80 + j * 7) % 360},35%,${22 + j % 5 * 8}%)"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${blocks}</svg>`;
    images.push(await sharp(Buffer.from(svg)).png().toBuffer());
  }
  await Promise.all(FILES.map((item, i) => writeFile(resolve(directory, item.name), images[i % images.length])));
  const result = await buildSite({
    outDir: ".cache/test-site", sourceDir: directory, quiet: true,
    imageOptions: { recipe: { ...RECIPE, avif: { ...RECIPE.avif, effort: 0 }, webp: { ...RECIPE.webp, effort: 0 } } }
  });
  await writeFile(".cache/test-manifest.json", JSON.stringify(result.manifest));
  await writeFile(".cache/test-report.json", JSON.stringify(result.report, null, 2));
  await mkdir(".cache/test-site/assets/test", { recursive: true });
  await writeFile(".cache/test-site/assets/test/original.png", images[0]);
  // Keep a source-mode test page beside the built site to verify backwards
  // compatibility with the existing branch-based GitHub Pages publication.
  const sourceDir = resolve(".cache/source-site");
  await mkdir(sourceDir, { recursive: true });
  for (const file of ["index.html", "404.html", "404.css", "style.css", "script.js", "gallery-data.js", "image-labels.js", "page.js", "project-viewer.js", "image-manifest.js", "image-utils.js", "image-loader.js", "load-queue.js", "lightbox.js", "sw.js", "apple-touch-icon.png", "manifest.json"]) {
    await copyFile(resolve(file), resolve(sourceDir, file));
  }
  for (const file of ["assets/fonts/FFFlauta-200.woff2", ...["bte", "endorah", "fight4glory", "mrbeast"].map((key) => `assets/credits/${key}.webp`)]) {
    await mkdir(resolve(sourceDir, file, ".."), { recursive: true });
    await copyFile(resolve(file), resolve(sourceDir, file));
  }
  await cp(resolve("assets/projects"), resolve(sourceDir, "assets/projects"), { recursive: true });
  const { files } = await renderSeo();
  for (const [name, html] of files) {
    await mkdir(resolve(sourceDir, name, ".."), { recursive: true });
    await writeFile(resolve(sourceDir, name), html);
  }
  for (const name of ["assets/icons/favicon-96.png", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/social/portfolio.png"]) {
    await mkdir(resolve(sourceDir, name, ".."), { recursive: true });
    await copyFile(resolve(name), resolve(sourceDir, name));
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await createFixture();
  console.log("Built isolated browser fixtures in .cache/test-site and .cache/source-site (not production photos).");
}
