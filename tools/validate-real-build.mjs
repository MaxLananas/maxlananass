import { readFile, readdir, writeFile, appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";
import { FILES } from "../gallery-data.js";
import { checkSeo } from "./seo-check.mjs";

// Run only against a real release build, never the synthetic browser fixtures.
try {
const report = JSON.parse(await readFile(".cache/build-report.json", "utf8"));
assert.equal(report.source, "github-release", "Real validation must not use local fixtures");
assert.equal(report.images, FILES.length);
assert.deepEqual(report.files.map((file) => file.name).sort(), FILES.map((file) => file.name).sort());
const paths = new Set();
for (const file of report.files) {
  assert.ok(file.originalBytes > 0 && file.width > 0 && file.height > 0);
  for (const variant of file.variants) {
    const name = `${file.key}-${variant.file}`;
    if (paths.has(name)) continue;
    paths.add(name);
    const bytes = await readFile(resolve("dist/assets/gallery", name));
    assert.equal(bytes.length, variant.bytes);
    const image = await sharp(bytes).metadata();
    if (variant.format === "webp") assert.equal(image.format, "webp", `${name}: wrong WebP payload`);
    else {
      assert.equal(bytes.subarray(4, 8).toString(), "ftyp", `${name}: invalid AVIF container`);
      assert.ok(bytes.subarray(8, 48).includes(Buffer.from("avif")), `${name}: missing AVIF brand`);
    }
    assert.equal(image.width, variant.width);
    // libvips shrink-on-load may round a fractional height one pixel differently
    // from JavaScript Math.round (observed: 540 vs 541). Preserve aspect within
    // that documented bound; width, file size, format and original hashes stay strict.
    assert.ok(Math.abs(image.height - file.height * variant.width / file.width) <= 1, `${name}: unexpected resized height ${image.height}`);
    assert.ok(image.width <= file.width, "No upscaling");
  }
}
assert.equal(paths.size, report.variants);
assert.equal((await readdir("dist/assets/gallery")).length, paths.size);
const seo = await checkSeo({ directory: "dist", snapshots: false });
const summary = { commit: process.env.GITHUB_SHA || null, originals: report.images, sha256Verified: report.verifiedDigests, sourceBytes: report.originalBytes,
  variants: report.variants, variantBytes: report.variantBytes, pages: seo.pages, indexable: seo.indexable, orphanPages: seo.orphans };
await writeFile(".cache/real-build-validation.json", JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `originals=${summary.originals}\nvariants=${summary.variants}\ndigests=${summary.sha256Verified}\nbytes=${summary.variantBytes}\n`);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, "## Verified real image build\n\n```json\n" + JSON.stringify(summary, null, 2) + "\n```\n");

} catch (error) {
  console.error(`::error file=tools/validate-real-build.mjs::${String(error.message).replaceAll("%", "%25").replaceAll("\n", "%0A").replaceAll("\r", "%0D")}`);
  throw error;
}
