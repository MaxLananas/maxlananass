import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { RECIPE, prepareImages, validateFiles, variantWidths } from "../../tools/prepare-images.mjs";
import { buildSite } from "../../tools/build.mjs";

const recipe = { ...RECIPE, avif: { ...RECIPE.avif, effort: 0 }, webp: { ...RECIPE.webp, effort: 0 } };

test("asset names cannot escape the input/cache directory", () => {
  for (const name of ["../photo.png", "photo/other.png", "photo\\other.png", "x\0.png", "photo.svg", ""]) {
    assert.throws(() => validateFiles([{ name }]), /filename/);
  }
  assert.throws(() => validateFiles([{ name: "x.png" }, { name: "x.png" }]), /Duplicate/);
  assert.doesNotThrow(() => validateFiles([{ name: "Château (1).png" }]));
});

test("small originals are never enlarged or mislabeled in srcset", () => {
  assert.deepEqual(variantWidths(100), [100]);
  assert.deepEqual(variantWidths(320), [320]);
  assert.deepEqual(variantWidths(768), [320, 640, 768]);
  assert.deepEqual(variantWidths(1802), [320, 640, 960, 1600, 1802]);
  assert.deepEqual(variantWidths(4096), [320, 640, 960, 1600, 2560]);
});

test("generates real dimensions, alpha, placeholders, bounded variants and deterministic hashes", async () => {
  await mkdir(".cache", { recursive: true });
  const temporary = await mkdtemp(resolve(".cache/unit-images-"));
  try {
    const sourceDir = join(temporary, "originals");
    await mkdir(sourceDir);
    const original = await sharp({ create: { width: 480, height: 320, channels: 4, background: "#356699aa" } }).png().toBuffer();
    await writeFile(join(sourceDir, "photo.png"), original);
    const options = { files: [{ name: "photo.png" }], sourceDir, outputDir: join(temporary, "output"), cacheDir: temporary, recipe, onProgress: () => {} };
    const first = await prepareImages(options);
    const second = await prepareImages(options);
    assert.deepEqual(first.manifest, second.manifest);
    const meta = first.manifest["photo.png"];
    assert.equal(meta.width, 480);
    assert.equal(meta.height, 320);
    assert.deepEqual(meta.widths, [320, 480]);
    assert.match(meta.color, /^#[\da-f]{6}$/);
    assert.match(meta.placeholder, /^data:image\/webp;base64,/);
    const placeholder = await sharp(Buffer.from(meta.placeholder.split(",")[1], "base64")).metadata();
    assert.ok(placeholder.width <= 20 && placeholder.height <= 20);
    for (const width of meta.widths) for (const format of ["avif", "webp"]) {
      const filename = meta.base.replace("assets/gallery/", "") + `-${width}.${format}`;
      const encoded = await sharp(await readFile(join(options.outputDir, filename))).metadata();
      assert.equal(encoded.width, width);
      assert.equal(encoded.height, Math.round(width * 320 / 480));
      assert.equal(encoded.hasAlpha, true);
    }
    assert.deepEqual(await readFile(join(sourceDir, "photo.png")), original, "the original must remain byte-for-byte identical");
    const changed = await prepareImages({ ...options, recipe: { ...recipe, version: 2 } });
    assert.notEqual(changed.manifest["photo.png"].base, meta.base, "encoder changes must invalidate cached URLs");
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test("missing/corrupt images stop publication, not silently an incomplete manifest", async () => {
  await mkdir(".cache", { recursive: true });
  const temporary = await mkdtemp(resolve(".cache/unit-missing-"));
  try {
    await writeFile(join(temporary, "bad.png"), "An HTML error page");
    await assert.rejects(prepareImages({ files: [{ name: "bad.png" }], sourceDir: temporary, outputDir: join(temporary, "out"), cacheDir: temporary, recipe, onProgress: () => {} }));
    await assert.rejects(prepareImages({ files: [{ name: "absent.png" }], sourceDir: temporary, outputDir: join(temporary, "out"), cacheDir: temporary, recipe, onProgress: () => {} }), /ENOENT/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test("build cannot delete the checkout, .git or arbitrary directories", async () => {
  for (const outDir of [".", ".git", "..", "/home/user", "assets", ".cache"]) {
    await assert.rejects(buildSite({ outDir }), /Output must be/);
  }
});
