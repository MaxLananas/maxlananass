import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { PROJECTS, FEATURED_PROJECT_SLUGS, developmentProjects } from "../../content/projects.js";
import { projectMedia } from "../../tools/project-content.mjs";
import { renderSeo } from "../../tools/seo-render.mjs";
import { load } from "cheerio";

test("iProf leads the showcase, ten published projects use Modrinth, references are demoted", () => {
  assert.equal(FEATURED_PROJECT_SLUGS[0], "iprof-redesign");
  assert.equal(PROJECTS.filter(p => p.collection === "release" && p.modrinth).length, 10);
  assert.equal(PROJECTS.find(p => p.slug === "iprof-redesign").media.length, 11);
  assert.ok(!developmentProjects().some(p => ["builders-utilities-bt-corsica", "bte-france-guidelines"].includes(p.slug)));
  for (const slug of ["tracebte", "builders-utilities-bt-corsica", "bte-france-guidelines", "bte-distortion-calculator", "le-mans"]) assert.ok(PROJECTS.some(p => p.slug === slug), "Retain existing URLs");
});

test("prepared project images exist at their real dimensions and remain bounded", async () => {
  let total = 0;
  for (const [key, entry] of Object.entries(projectMedia)) {
    if (key === "video") continue;
    for (const variant of entry.variants) {
      assert.match(variant.path, /^assets\/projects\/[a-z0-9-]+-\d+\.(avif|webp)$/);
      const bytes = await readFile(variant.path);
      assert.equal(bytes.length, variant.bytes);
      total += bytes.length;
      const info = await sharp(bytes).metadata();
      assert.equal(info.width, variant.width);
      assert.equal(info.height, Math.round(entry.height * variant.width / entry.width));
      assert.ok(info.width <= entry.width, "Do not invent source resolution");
    }
    if (entry.social) {
      const image = await sharp(await readFile(entry.social)).metadata();
      assert.equal(image.width, 1200); assert.equal(image.height, 630);
    }
  }
  assert.ok(total < 12 * 1024 * 1024, "No original album or video payload in the initial site assets");
});

test("iProf is a design study with real media, not a fake government service", async () => {
  const { files } = await renderSeo();
  const $ = load(files.get("projects/iprof-redesign/index.html"));
  assert.equal($(".project-gallery-item").length, 11);
  assert.equal($("iframe, form").length, 0, "No third-party player or credential form");
  assert.equal($("video[preload=none][controls]").length, 1);
  assert.match($(".case-study").text(), /fictitious/);
  assert.match($("meta[property='og:image']").attr("content"), /iprof-cover.*social\.jpg$/);
  const graph = JSON.parse($("script[type='application/ld+json']").text())["@graph"];
  assert.equal(graph.find(n => n["@id"].endsWith("#project"))["@type"], "CreativeWork");
  assert.equal(graph.find(n => n["@type"] === "MediaObject").uploadDate, undefined, "Do not invent an upload date for a rich result");
});

test("all regular page footers link to the creator’s exact Modrinth profile", async () => {
  const { files } = await renderSeo();
  for (const [path, html] of files) if (path.endsWith(".html")) {
    const $ = load(html);
    assert.ok($("footer a[href='https://modrinth.com/user/maxlananass']").length, path);
    assert.ok(!html.includes("/undefined/") && !html.includes('href="undefined"'));
  }
});
