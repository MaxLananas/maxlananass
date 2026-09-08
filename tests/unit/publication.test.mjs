import test from "node:test";
import assert from "node:assert/strict";
import { publicationPlan } from "../../tools/publication-plan.mjs";
import { byteRange, staticServer } from "../../tools/serve.mjs";
import { pageDates, validDate } from "../../content/dates.js";
import { schemaFor } from "../../tools/seo-render.mjs";
import { helpers } from "../../tools/seo-content.mjs";
import { sitePages } from "../../content/pages.js";
import video from "../../content/iprof-video.json" with { type: "json" };
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";

test("validation can never deploy; legacy mode never encodes an unused album", () => {
  for (const ref of ["refs/heads/main", "refs/heads/arena/01a07ce9-maxlananass"]) assert.deepEqual(publicationPlan({ mode: "validate", publication: "workflow", ref, event: "workflow_dispatch" }), { build: true, deploy: false, legacy: false });
  assert.deepEqual(publicationPlan({ publication: "legacy", ref: "refs/heads/main", event: "push" }), { build: false, deploy: false, legacy: true });
  assert.deepEqual(publicationPlan({ publication: "workflow", ref: "refs/heads/main", event: "push" }), { build: true, deploy: true, legacy: false });
  assert.deepEqual(publicationPlan({ publication: "workflow", ref: "refs/heads/main", event: "pull_request" }), { build: false, deploy: false, legacy: false });
  assert.throws(() => publicationPlan({ mode: "deploy", publication: "workflow", ref: "refs/heads/other", event: "workflow_dispatch" }));
});

test("each page owns dates; changing a review does not republish an article", () => {
  const records = { "/": { modified: "2026-09-07", reviewed: "2026-09-07" }, "/story/": { published: "2026-09-07", modified: "2026-09-08", reviewed: "2026-09-09" } };
  assert.equal(pageDates("/", records).published, undefined);
  assert.equal(pageDates("/story/", records).published, "2026-09-07");
  assert.equal(validDate("2026-02-30"), false);
  assert.throws(() => pageDates("/missing/", records));
  const pages = sitePages(), original = pages.find(p => p.type === "Article");
  const page = { ...original, modified: "2026-09-08", reviewed: "2026-09-09" };
  const article = schemaFor(page, pages, helpers())["@graph"].find(n => n["@type"] === "Article");
  assert.equal(article.datePublished, original.published);
  assert.equal(article.dateModified, page.modified);
});

test("the movie is a verified native asset, not a renamed HTML download", async () => {
  const bytes = await readFile(video.file);
  assert.equal(bytes.length, video.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), video.sha256);
  assert.equal(bytes.subarray(4, 8).toString(), "ftyp");
  assert.equal(video.codec, "h264");
  assert.equal(video.remuxedWithoutReencoding, true);
  assert.ok(video.duration > 47 && video.duration < 48);
  assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), "Fast-start metadata must precede the media payload");
});

test("byte ranges handle bounded, open-ended and suffix requests safely", () => {
  assert.deepEqual(byteRange("bytes=0-9", 100), { start: 0, end: 9 });
  assert.deepEqual(byteRange("bytes=90-", 100), { start: 90, end: 99 });
  assert.deepEqual(byteRange("bytes=-10", 100), { start: 90, end: 99 });
  assert.deepEqual(byteRange("bytes=95-200", 100), { start: 95, end: 99 });
  for (const input of ["bytes=100-", "bytes=20-10", "bytes=-0", "bytes=", "bytes=0-9,20-29", "bytes=9999999999999999999999-", "things=0-10"]) assert.equal(byteRange(input, 100), null);
});

test("native video range delivery is 206, unsatisfiable requests are 416, HEAD is body-free", async () => {
  const server = staticServer(process.cwd());
  await new Promise(r => server.listen(0, "0.0.0.0", r));
  try {
    const url = `http://127.0.0.1:${server.address().port}/${video.file}`;
    const part = await fetch(url, { headers: { range: "bytes=0-1023" } });
    assert.equal(part.status, 206); assert.equal(part.headers.get("content-type"), "video/mp4");
    assert.equal(part.headers.get("content-range"), `bytes 0-1023/${video.bytes}`);
    assert.equal((await part.arrayBuffer()).byteLength, 1024);
    const missing = await fetch(url, { headers: { range: `bytes=${video.bytes}-` } });
    assert.equal(missing.status, 416); assert.equal(missing.headers.get("content-range"), `bytes */${video.bytes}`);
    const head = await fetch(url, { method: "HEAD", headers: { range: "bytes=0-10" } });
    assert.equal(head.status, 200); assert.equal(head.headers.get("content-length"), String(video.bytes));
    assert.equal((await head.arrayBuffer()).byteLength, 0);
  } finally { await new Promise(r => server.close(r)); }
});

test("temporary GitHub write transport and branch-bound media workflow are gone", async () => {
  await assert.rejects(access(".github/workflows/project-media.yml"));
  const importer = await readFile("tools/import-project-media.mjs", "utf8");
  assert.ok(!importer.includes("--github-transfer") && !importer.includes("git/blobs"));
  const workflow = await readFile(".github/workflows/pages.yml", "utf8");
  assert.ok(!workflow.includes("contents: write") && !workflow.includes("checks: write"));
  assert.ok(workflow.includes("Verify the public site after publication"));
});

test("bounded public verification retries fail visibly instead of hiding a bad deployment", async () => {
  const { verifyLive } = await import("../../tools/verify-live.mjs");
  let sleeps = 0;
  await assert.rejects(verifyLive({ attempts: 3, delay: 0, sleep: async () => { sleeps++; }, fetcher: async () => new Response("<title>Old deployment</title>") }), /failed after 3 attempt/);
  assert.equal(sleeps, 2);
});
