import { readFile, writeFile, mkdir, copyFile, rename, stat } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { FILES, RELEASE_BASE } from "../gallery-data.js";
import { IMAGE_WIDTHS } from "../image-utils.js";

export const RECIPE = {
  version: 1,
  sharp: sharp.versions.sharp,
  vips: sharp.versions.vips,
  avif: { quality: 70, effort: 6, chromaSubsampling: "4:4:4" },
  webp: { quality: 90, effort: 6, smartSubsample: true },
  kernel: "lanczos3"
};
const MAX_SOURCE_BYTES = 100 * 1024 * 1024;
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function validateFiles(files) {
  const seen = new Set();
  for (const file of files) {
    if (!file.name || basename(file.name) !== file.name || /[\\\x00-\x1f]/.test(file.name) || !/\.(png|jpe?g|webp|avif)$/i.test(file.name)) {
      throw new Error(`Unsafe or unsupported image filename: ${file.name}`);
    }
    if (seen.has(file.name)) throw new Error(`Duplicate image filename: ${file.name}`);
    seen.add(file.name);
  }
}

export function variantWidths(width, sizes = IMAGE_WIDTHS) {
  return [...new Set([...sizes.filter((size) => size < width), Math.min(width, sizes.at(-1))])];
}

async function exists(file) {
  try { return (await stat(file)).isFile(); } catch (_) { return false; }
}

async function atomicWrite(file, bytes) {
  await mkdir(resolve(file, ".."), { recursive: true });
  const temporary = file + ".part-" + process.pid;
  await writeFile(temporary, bytes);
  await rename(temporary, file);
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(500 * (attempt + 1));
    }
  }
  // Signed redirect URLs/tokens are intentionally not logged or written to disk.
  throw new Error(`Unable to download ${new URL(url).pathname}: ${lastError.message}`);
}

async function releaseIndex(releaseBase, cacheDir, offline) {
  const url = new URL(releaseBase);
  const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/$/);
  if (url.origin !== "https://github.com" || !match) throw new Error("Expected a public GitHub release URL");
  const [, owner, repo, tag] = match;
  const cachePath = join(cacheDir, "releases", hash(releaseBase) + ".json");
  let release;
  if (offline) {
    release = JSON.parse(await readFile(cachePath, "utf8"));
  } else {
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    // Used only for the API's rate limit on CI, never forwarded to image downloads.
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetchWithRetry(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, { headers });
    release = await response.json();
    // Releases with more than 100 assets need pagination (the API currently returns
    // this complete release, but the assets endpoint is the authoritative fallback).
    if (release.assets?.length >= 100) {
      const assets = [];
      for (let page = 1; ; page++) {
        const batch = await (await fetchWithRetry(`https://api.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?per_page=100&page=${page}`, { headers })).json();
        assets.push(...batch);
        if (batch.length < 100) break;
      }
      release.assets = assets;
    }
    await atomicWrite(cachePath, JSON.stringify({ assets: release.assets.map(({ name, size, digest }) => ({ name, size, digest })) }));
  }
  return new Map(release.assets.map((asset) => [asset.name, asset]));
}

async function getOriginal(item, { sourceDir, cacheDir, releaseBase, assets, offline }) {
  if (sourceDir) {
    const buffer = await readFile(join(sourceDir, item.name));
    if (buffer.length > MAX_SOURCE_BYTES) throw new Error(`${item.name} exceeds the 100 MiB safety limit`);
    return buffer;
  }
  const asset = assets.get(item.name);
  if (!asset) throw new Error(`The release does not contain ${item.name}`);
  if (asset.size > MAX_SOURCE_BYTES) throw new Error(`${item.name} exceeds the 100 MiB safety limit`);
  const file = join(cacheDir, "originals", item.name);
  const valid = (buffer) => buffer.length === asset.size && (!asset.digest?.startsWith("sha256:") || "sha256:" + hash(buffer) === asset.digest);
  try {
    const buffer = await readFile(file);
    if (valid(buffer)) return buffer;
  } catch (_) {}
  if (offline) throw new Error(`No verified cached original for ${item.name}`);
  const response = await fetchWithRetry(releaseBase + encodeURIComponent(item.name));
  if (Number(response.headers.get("content-length")) > MAX_SOURCE_BYTES) {
    await response.body?.cancel();
    throw new Error(`${item.name} exceeds the 100 MiB safety limit`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!valid(buffer)) throw new Error(`Size/SHA-256 mismatch for ${item.name}; refusing to publish a corrupt image`);
  // Decode the header before caching; an HTML error page must never become an image.
  await sharp(buffer, { limitInputPixels: 100_000_000 }).metadata();
  await atomicWrite(file, buffer);
  return buffer;
}

export async function prepareImages({
  files = FILES,
  releaseBase = RELEASE_BASE,
  outputDir = "dist/assets/gallery",
  cacheDir = ".cache",
  sourceDir,
  offline = false,
  widths = IMAGE_WIDTHS,
  recipe = RECIPE,
  concurrency = 2,
  onProgress = (message) => console.log(message)
} = {}) {
  validateFiles(files);
  outputDir = resolve(outputDir);
  cacheDir = resolve(cacheDir);
  if (sourceDir) sourceDir = resolve(sourceDir);
  await mkdir(outputDir, { recursive: true });
  const assets = sourceDir ? null : await releaseIndex(releaseBase, cacheDir, offline);
  const results = new Array(files.length);
  const inFlight = new Map();
  let cursor = 0;
  sharp.cache({ memory: 32, files: 20, items: 50 });
  sharp.concurrency(1); // Bound RAM/CPU on a small runner; run two independent photos.

  async function encode(buffer, key) {
    const cachePath = join(cacheDir, "optimized", key);
    const metadataFile = join(cachePath, "metadata.json");
    let info;
    try {
      const cached = JSON.parse(await readFile(metadataFile, "utf8"));
      if ((await Promise.all(cached.variants.map((v) => exists(join(cachePath, v.file))))).every(Boolean)) info = cached;
    } catch (_) {}
    if (!info) {
      const oriented = sharp(buffer, { limitInputPixels: 100_000_000 }).rotate().toColourspace("srgb");
      const meta = await oriented.metadata();
      const { width, height } = meta.autoOrient || meta;
      if (!width || !height || meta.pages > 1) throw new Error("Only static, decodable images are supported");
      const availableWidths = variantWidths(width, widths);
      const placeholder = await oriented.clone().resize({ width: 20, height: 20, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 35, effort: 6 }).toBuffer();
      const pixel = await oriented.clone().resize(1, 1, { fit: "fill" }).removeAlpha().raw().toBuffer();
      const color = "#" + [...pixel.subarray(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("");
      const variants = [];
      for (const size of availableWidths) {
        const image = oriented.clone().resize({ width: size, withoutEnlargement: true, kernel: recipe.kernel });
        for (const format of ["avif", "webp"]) {
          const bytes = await image.clone()[format](recipe[format]).toBuffer();
          const file = `${size}.${format}`;
          await atomicWrite(join(cachePath, file), bytes);
          variants.push({ file, width: size, format, bytes: bytes.length });
        }
      }
      info = { width, height, widths: availableWidths, color, placeholder: "data:image/webp;base64," + placeholder.toString("base64"), variants };
      // A complete metadata file is the atomic marker for a successful generation.
      await atomicWrite(metadataFile, JSON.stringify(info));
    }
    for (const variant of info.variants) {
      await copyFile(join(cachePath, variant.file), join(outputDir, `${key}-${variant.file}`));
    }
    return info;
  }

  async function worker() {
    while (cursor < files.length) {
      const index = cursor++;
      const item = files[index];
      const buffer = await getOriginal(item, { sourceDir, cacheDir, releaseBase, assets, offline });
      const key = hash(Buffer.concat([buffer, Buffer.from(JSON.stringify({ recipe, widths }))])).slice(0, 16);
      if (!inFlight.has(key)) inFlight.set(key, encode(buffer, key));
      const info = await inFlight.get(key);
      results[index] = { name: item.name, key, originalBytes: buffer.length, ...info };
      onProgress(`[${index + 1}/${files.length}] ${item.name} → ${info.widths.join(", ")}px AVIF/WebP`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  const manifest = Object.fromEntries(results.map(({ name, key, width, height, widths, color, placeholder }) => [name, {
    base: "assets/gallery/" + key, width, height, widths, color, placeholder
  }]));
  const unique = [...new Map(results.map((result) => [result.key, result])).values()];
  const report = {
    images: results.length,
    originalBytes: results.reduce((sum, item) => sum + item.originalBytes, 0),
    variantBytes: unique.reduce((sum, item) => sum + item.variants.reduce((n, variant) => n + variant.bytes, 0), 0),
    variants: unique.reduce((sum, item) => sum + item.variants.length, 0),
    recipe,
    files: results.map(({ name, originalBytes, width, height, variants }) => ({ name, originalBytes, width, height, variants }))
  };
  return { manifest, report };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const sourceDir = args.includes("--source-dir") ? args[args.indexOf("--source-dir") + 1] : undefined;
  try {
    const result = await prepareImages({ sourceDir, offline: args.includes("--offline") });
    await atomicWrite(".cache/image-manifest.json", JSON.stringify(result.manifest));
    await atomicWrite(".cache/image-report.json", JSON.stringify(result.report, null, 2));
    console.log(`Prepared ${result.report.images} photos. Originals have not been modified.`);
  } catch (error) {
    console.error(error.message);
    console.error("No new site was published. Retry with network access, or use --source-dir /path/to/originals.");
    process.exitCode = 1;
  }
}
