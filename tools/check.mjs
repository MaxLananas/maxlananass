import { readFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { gzipSync } from "node:zlib";
import { FILES, CREDITS } from "../gallery-data.js";
import { validateFiles } from "./prepare-images.mjs";

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
validateFiles(FILES);
for (const item of FILES) {
  if (item.credit && !CREDITS[item.credit]) throw new Error(`Unknown credit: ${item.credit}`);
  if (!Array.isArray(item.tags)) throw new Error(`Missing search tags array: ${item.name}`);
}
async function localFile(url, from = root) {
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) return;
  const path = url.split(/[?#]/)[0];
  const file = path.startsWith("/") ? resolve(root, "." + path) : resolve(from, path);
  if (!(await stat(file)).isFile()) throw new Error(`Missing local asset: ${url}`);
}
for (const file of ["index.html", "404.html"]) {
  const html = await readFile(resolve(root, file), "utf8");
  for (const element of html.matchAll(/<(?:link|script|img)\b[^>]*>/g)) {
    const url = element[0].match(/(?:src|href)="([^"]+)"/);
    if (url) await localFile(url[1]);
  }
}
for (const file of ["style.css", "404.css"]) {
  const css = await readFile(resolve(root, file), "utf8");
  for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) await localFile(match[1]);
}
for (const credit of Object.values(CREDITS)) await localFile(credit.logo);
const tracked = (await exec("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root })).stdout.split("\0");
const scripts = tracked.filter((file) => /\.(mjs|js)$/.test(file));
for (const file of scripts) {
  await exec(process.execPath, ["--check", file], { cwd: root });
  const source = await readFile(resolve(root, file), "utf8");
  for (const match of source.matchAll(/(?:from\s*|import\s*\()\s*["'](\.[^"']+)["']/g)) await localFile(match[1], dirname(resolve(root, file)));
}
const runtimeFiles = ["script.js", "gallery-data.js", "image-manifest.js", "image-utils.js", "image-loader.js", "load-queue.js"];
const gzipBytes = (await Promise.all(runtimeFiles.map(async (file) => gzipSync(await readFile(resolve(root, file))).length)))
  .reduce((sum, size) => sum + size, 0);
if (gzipBytes > 25 * 1024) throw new Error(`Source startup JavaScript exceeds its 25 KiB gzip budget: ${gzipBytes}`);
console.log(`Checked ${FILES.length} builds, every local reference and ${scripts.length} JavaScript files.`);
console.log(`Source startup JavaScript: ${(gzipBytes / 1024).toFixed(1)} KiB gzip. Browser dependencies: 0.`);
