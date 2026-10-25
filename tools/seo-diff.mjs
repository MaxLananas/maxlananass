import { readFile, readdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { resolve, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const DEPLOY_ONLY = new Set(["_headers", "_redirects", "robots.txt", "manifest.json", "sw.js"]);
const IGNORED = new Set([".git", ".github", ".cache", "node_modules", "dist", "assets", "sources", "content", "docs", "templates", "tests", "tools", "scripts"]);
const posix = (value) => value.split(sep).join("/");

function firstDifference(expected, actual) {
  let index = 0;
  const limit = Math.min(expected.length, actual.length);
  while (index < limit && expected[index] === actual[index]) index++;
  const from = Math.max(0, index - 70);
  return { offset: index, rendered: expected.slice(from, index + 110), onDisk: actual.slice(from, index + 110) };
}

async function walk(directory, base = root) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED.has(entry.name)) continue;
      found.push(...await walk(full, base));
    } else if (entry.name === "index.html" || entry.name === "404.html" || /^sitemap\.xml$/.test(entry.name)) {
      found.push(posix(relative(base, full)));
    }
  }
  return found;
}

export async function renderedDiff({ directory = root } = {}) {
  directory = resolve(directory);
  // Fresh render with the retro pipeline into a scratch directory.
  const tmp = await mkdtemp(join(tmpdir(), "retro-diff-"));
  await new Promise((done, fail) => execFile(process.execPath, [resolve(root, "tools/retro-render.mjs")], { env: { ...process.env, RETRO_OUT: tmp } }, (err) => err ? fail(err) : done()));
  const expected = new Map();
  for (const file of await walk(tmp, tmp)) expected.set(file, await readFile(join(tmp, file), "utf8"));
  await rm(tmp, { recursive: true, force: true });

  const missing = [], changed = [];
  for (const [file, value] of expected) {
    const onDisk = await readFile(resolve(directory, file), "utf8").catch(() => null);
    if (onDisk === null) { missing.push(file); continue; }
    if (onDisk !== value) changed.push({ file, renderedBytes: value.length, diskBytes: onDisk.length, ...firstDifference(value, onDisk) });
  }
  const onDiskFiles = directory === root ? await walk(root) : [];
  const stale = onDiskFiles.filter((file) => !expected.has(file) && !DEPLOY_ONLY.has(file)).sort();
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
