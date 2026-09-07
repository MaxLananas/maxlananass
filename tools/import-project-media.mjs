// Explicit import only; never runs during a normal visitor request or site build.
// Originals remain on the supplied Drive / Modrinth. Outputs stay in .cache
// until the maintainer reviews them. This tool never calls GitHub write APIs.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const sources = JSON.parse(await readFile(resolve(root, "content/project-media-sources.json"), "utf8"));
const out = resolve(root, ".cache/project-media-import");
await mkdir(out, { recursive: true });
const manifest = {};
const reviewThumbs = [];
const sha = (data) => createHash("sha256").update(data).digest("hex");

async function download(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !["drive.usercontent.google.com", "api.modrinth.com", "cdn.modrinth.com"].includes(parsed.hostname)) throw new Error("Unapproved media source");
  const response = await fetch(url, { signal: AbortSignal.timeout(60000), headers: { "user-agent": "MaxLananas-Portfolio/1.0 (https://github.com/MaxLananas/maxlananass)" } });
  if (!response.ok) throw new Error(`Media download HTTP ${response.status}: ${parsed.hostname}${parsed.pathname}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 64 * 1024 * 1024) throw new Error("Media exceeds the 64 MiB import limit");
  return bytes;
}
async function save(path, bytes) {
  const file = resolve(out, path);
  if (!file.startsWith(out + "/")) throw new Error("Unsafe media output");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes);
}
async function image(key, url, { icon = false, social = false, review = false } = {}) {
  if (!/^[a-z0-9-]+$/.test(key)) throw new Error("Invalid media key");
  const input = await download(url);
  const meta = await sharp(input, { limitInputPixels: 100_000_000 }).metadata();
  const { width, height } = meta.autoOrient || meta;
  const pipeline = sharp(input).rotate().toColourspace("srgb");
  const hash = sha(Buffer.concat([input, Buffer.from("portfolio-project-media-v1:" + sharp.versions.vips)])).slice(0, 16);
  const base = `assets/projects/${key}-${hash}`;
  const sizes = icon ? [96, 256] : key.startsWith("iprof-") ? [640, 1280, 1920] : [640, 1280];
  const widths = [...new Set(sizes.map((size) => Math.min(size, width)))];
  const variants = [];
  for (const size of widths) for (const format of icon ? ["webp"] : ["webp", "avif"]) {
    const transform = pipeline.clone().resize({ width: size, withoutEnlargement: true });
    const data = format === "webp" ? await transform.webp({ quality: 94, effort: 6 }).toBuffer()
      : await transform.avif({ quality: 80, effort: 4, chromaSubsampling: "4:4:4" }).toBuffer();
    const path = `${base}-${size}.${format}`;
    await save(path, data);
    variants.push({ path, width: size, bytes: data.length, format });
  }
  let socialPath;
  if (social) {
    socialPath = `${base}-social.jpg`;
    await save(socialPath, await pipeline.clone().resize(1200, 630, { fit: "contain", background: "#0a0a0b" }).flatten({ background: "#0a0a0b" }).jpeg({ quality: 94, chromaSubsampling: "4:4:4" }).toBuffer());
  }
  manifest[key] = { width, height, widths, variants, ...(socialPath ? { social: socialPath } : {}), source: url, sourceSha256: sha(input) };
  if (review) reviewThumbs.push(await pipeline.clone().resize(640, 400, { fit: "contain", background: "#ddd" }).png().toBuffer());
  console.log(`Prepared ${key}: ${width}×${height}, ${variants.length} variants`);
}

sharp.concurrency(1);
for (const item of sources.screenshots) await image(item.key, `https://drive.usercontent.google.com/download?id=${item.id}&export=download&confirm=t`, { social: item.key === "iprof-cover", review: true });
await save("review/contact-sheet.jpg", await sharp({ create: { width: 1280, height: Math.ceil(reviewThumbs.length / 2) * 400, channels: 3, background: "#ddd" } }).composite(reviewThumbs.map((input, i) => ({ input, left: i % 2 * 640, top: Math.floor(i / 2) * 400 }))).jpeg({ quality: 92 }).toBuffer());

const projects = JSON.parse((await download(`https://api.modrinth.com/v2/user/${sources.modrinthUser}/projects`)).toString("utf8"));
await save("review/modrinth-projects.json", Buffer.from(JSON.stringify(projects, null, 2)));
for (const project of projects) {
  if (project.icon_url) await image(`modrinth-${project.slug}-icon`, project.raw_icon_url || project.icon_url, { icon: true });
  if ((sources.galleryProjects.includes(project.slug) || /nostalgia/i.test(project.title)) && project.gallery?.length) {
    const cover = project.gallery.find((item) => item.featured) || project.gallery[0];
    await image(`modrinth-${project.slug}-cover`, cover.raw_url || cover.url, { social: true });
  }
}

await save("project-media.json", Buffer.from(JSON.stringify(manifest, null, 2) + "\n"));
console.log("Prepared images are ready for review in .cache/project-media-import. No site or branch was changed.");
