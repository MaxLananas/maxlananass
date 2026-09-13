import { readFile, readdir } from "node:fs/promises";
import { resolve, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { renderSeo, serviceWorkerRoutes } from "./seo-render.mjs";

const root = resolve(import.meta.dirname, "..");
const IGNORED = new Set([".git", ".github", ".cache", "node_modules", "dist", "assets", "sources", "content", "docs", "templates", "tests", "tools", "scripts"]);
const posix = (value) => value.split(sep).join("/");

function firstDifference(expected, actual) {
  let index = 0;
  const limit = Math.min(expected.length, actual.length);
  while (index < limit && expected[index] === actual[index]) index++;
  const from = Math.max(0, index - 70);
  return { offset: index, rendered: expected.slice(from, index + 110), onDisk: actual.slice(from, index + 110) };
}

async function walk(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED.has(entry.name)) continue;
      found.push(...await walk(full));
    } else if (entry.name === "index.html" || entry.name === "404.html" || /^(sitemap[^/]*\.xml|robots\.txt|manifest\.json|site-pages\.json|_headers|_redirects)$/.test(entry.name)) {
      found.push(posix(relative(root, full)));
    }
  }
  return found;
}

export async function renderedDiff({ directory = root } = {}) {
  directory = resolve(directory);
  const { files, pages } = await renderSeo();
  const expected = new Map(files);
  const worker = await readFile(resolve(root, "sw.js"), "utf8");
  const routed = serviceWorkerRoutes(worker, pages);
  if (routed !== worker) expected.set("sw.js", routed);

  const missing = [], changed = [];
  for (const [file, value] of expected) {
    const onDisk = await readFile(resolve(directory, file), "utf8").catch(() => null);
    if (onDisk === null) { missing.push(file); continue; }
    if (onDisk !== value) changed.push({ file, renderedBytes: value.length, diskBytes: onDisk.length, ...firstDifference(value, onDisk) });
  }
  const onDiskFiles = directory === root ? await walk(root) : [];
  const stale = onDiskFiles.filter((file) => !expected.has(file)).sort();
  return { generated: expected.size, missing, changed, stale, clean: !missing.length && !changed.length && !stale.length };
}

function report(result) {
  if (result.clean) {
    console.log(`Rendered HTML diff clean: ${result.generated} generated files match the committed output.`);
    return;
  }
  console.error(`Rendered HTML differs from the committed output (${result.generated} generated files checked).`);
  for (const file of result.missing) console.error(`  missing  ${file}`);
  for (const file of result.stale) console.error(`  stale    ${file} (no longer rendered; delete it)`);
  for (const item of result.changed) {
    console.error(`  changed  ${item.file} (rendered ${item.renderedBytes} B, on disk ${item.diskBytes} B, first difference at ${item.offset})`);
    console.error(`           rendered: ${JSON.stringify(item.rendered)}`);
    console.error(`           on disk : ${JSON.stringify(item.onDisk)}`);
  }
  console.error("Run npm run seo:render and commit the regenerated files.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const directory = args.includes("--dir") ? args[args.indexOf("--dir") + 1] : root;
  const result = await renderedDiff({ directory });
  if (args.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else report(result);
  if (!result.clean) process.exitCode = 1;
}
