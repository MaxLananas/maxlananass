import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
const root = resolve(import.meta.dirname, "..");

// A release fingerprint, NOT an editorial publication/modification date.
// It is identical in source and optimized deployments: generated image URLs and
// esbuild filenames do not change the identity of the authored release.
export async function contentVersion() {
  const files = ["style.css", "404.css", "404.html", "script.js", "page.js", "project-viewer.js", "lightbox.js", "image-utils.js", "image-loader.js", "image-labels.js", "gallery-data.js", "load-queue.js",
    "tools/seo-render.mjs", "tools/seo-content.mjs", "tools/project-content.mjs", "tools/iprof-case-study.mjs", "tools/brand.mjs", "tools/content-version.mjs"];
  for (const directory of ["content", "templates"]) {
    for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) if (entry.isFile()) files.push(directory + "/" + entry.name);
  }
  const hash = createHash("sha256");
  for (const file of files.sort()) { hash.update(file + "\0"); hash.update(await readFile(resolve(root, file))); }
  return hash.digest("hex").slice(0, 20);
}
