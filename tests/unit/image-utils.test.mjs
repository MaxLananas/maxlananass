import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { FILES, CREDITS, RELEASE_BASE } from "../../gallery-data.js";
import { connectionProfile, selectWidth, imageSources, proxyUrl, originalUrl, normalizeSearch, parseDateFromFilename } from "../../image-utils.js";

// Frozen from the original portfolio: changing the loader must not lose a build,
// search tag, attribution, or outbound credit link. Logo paths may be optimized.
const catalog = JSON.stringify({
  release: RELEASE_BASE,
  files: FILES,
  credits: Object.fromEntries(Object.entries(CREDITS).map(([key, { logo, ...credit }]) => [key, credit]))
});

test("all original builds, tags and credits are preserved", () => {
  assert.equal(FILES.length, 101);
  assert.equal(new Set(FILES.map((file) => file.name)).size, 101);
  assert.equal(FILES.filter((file) => file.credit).length, 41);
  assert.equal(createHash("sha256").update(catalog).digest("hex"), "7e8638845b07d149f72bb6c65a85f416db1b7fc0803cb9d0ed3bce41fa81a3ff");
});

test("unknown/slow/save-data connections never authorize HD speculation", () => {
  assert.equal(connectionProfile().prefetch, false);
  for (const effectiveType of ["slow-2g", "2g", "3g"]) {
    const profile = connectionProfile({ effectiveType, downlink: 10, rtt: 50 });
    assert.equal(profile.prefetch, false);
    assert.ok(profile.concurrency <= 3);
    assert.ok(profile.margin <= 160);
    assert.equal("scale" in profile, false, "do not secretly reduce image resolution");
    assert.equal("quality" in profile, false, "quality must not drop to 55 on slow connections");
  }
  assert.deepEqual(connectionProfile({ saveData: true, effectiveType: "4g" }), { concurrency: 2, margin: 0, prefetch: false, timeout: 60000 });
  assert.equal(connectionProfile({ effectiveType: "4g", downlink: 10, rtt: 50 }).prefetch, true);
  assert.equal(connectionProfile({ effectiveType: "4g", downlink: 1, rtt: 50 }).prefetch, false);
});

test("responsive widths are shared buckets that round UP, including Retina", () => {
  assert.equal(selectWidth(280, 1), 320);
  assert.equal(selectWidth(321, 1), 640);
  assert.equal(selectWidth(180, 3), 640);
  assert.equal(selectWidth(450, 2), 960);
  assert.equal(selectWidth(1300, 2), 2560);
  assert.equal(selectWidth(10000, 3), 2560);
  assert.equal(selectWidth(400, 2, [200, 400, 768]), 768);
});

test("source publication uses explicit high-quality WebP with bounded sizes", () => {
  const item = { name: "a build & detail.png" };
  const url = new URL(proxyUrl(item, 640));
  assert.equal(url.origin, "https://wsrv.nl");
  assert.equal(url.searchParams.get("output"), "webp");
  assert.equal(url.searchParams.get("q"), "90");
  assert.equal(url.searchParams.get("w"), "640");
  assert.ok(url.searchParams.has("we"));
  assert.equal(url.searchParams.get("url"), originalUrl(item));
  assert.equal(originalUrl(item), RELEASE_BASE + "a%20build%20%26%20detail.png");
  const grid = imageSources(item, 180, 3);
  assert.equal(grid.width, 640);
  assert.equal(grid.sizes, "180px");
  assert.equal(grid.avif, "");
  assert.ok(grid.webp.includes("320w"));
  assert.ok(!grid.webp.includes("1600w"));
  const viewer = imageSources(item, 1100, 2, "viewer");
  assert.equal(viewer.width, 2560);
  assert.ok(viewer.webp.includes("2560w"));
});

test("search remains bilingual and is insensitive to accents/case", () => {
  assert.equal(normalizeSearch("  CHÂTEAU Médiéval  "), "chateau medieval");
  assert.equal(normalizeSearch(""), "");
  assert.equal(normalizeSearch("Ocapiat"), "ocapiat");
});

test("date sorting is deterministic in every timezone", () => {
  assert.equal(parseDateFromFilename("2026-07-06_21.59.15_4K.png"), Date.UTC(2026, 6, 6, 21, 59, 15));
  assert.equal(parseDateFromFilename("little-bridge.png"), null);
  assert.equal(parseDateFromFilename("Shot_01.jpg"), null);
});
