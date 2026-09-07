import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { renderSeo, schemaFor } from "../../tools/seo-render.mjs";
import { helpers } from "../../tools/seo-content.mjs";
import { checkSeo } from "../../tools/seo-check.mjs";
import { sitePages } from "../../content/pages.js";
import { canonical } from "../../content/site.js";
import { staticServer } from "../../tools/serve.mjs";

const pages = sitePages();

test("all source pages, crawl paths, image and page sitemaps stay synchronized", async () => {
  const result = await checkSeo();
  assert.equal(result.indexable, 22);
  assert.equal(result.originalScreenshots, 101);
  assert.equal(result.orphans, 0);
});

test("SEO generation is deterministic and does not change freshness on rebuild", async () => {
  const first = await renderSeo(), second = await renderSeo();
  assert.deepEqual([...first.files], [...second.files]);
  assert.equal(load(first.files.get("index.html"))("script[type='application/ld+json']").length, 1);
});

test("ownership, affiliation and upstream credits are not inflated by structured data", () => {
  const page = pages.find((p) => p.project?.slug === "builders-utilities-bt-corsica");
  const graph = schemaFor(page, pages, helpers())["@graph"];
  const code = graph.find((node) => node["@type"] === "SoftwareSourceCode");
  assert.equal(code.creator, undefined);
  assert.equal(code.contributor["@id"], canonical("/#person"));
  assert.equal(code.isBasedOn, "https://github.com/TehBrian/BuildersUtilities");
  assert.match(code.creditText, /TehBrian and Arcaniax/);
  const person = graph.find((node) => node["@type"] === "Person");
  assert.equal(person.memberOf, undefined);
  assert.equal(person.worksFor, undefined);
  assert.ok(graph.some((node) => node["@type"] === "Organization" && node.name === "BuildTheEarth"));
  assert.ok(!graph.some((node) => node["@type"] === "LocalBusiness" || node["@type"] === "Project"));
});

test("optional verification values are absent by default and HTML-escaped when supplied", async () => {
  const defaults = await renderSeo({ googleVerification: "", bingVerification: "" });
  assert.equal(load(defaults.files.get("index.html"))("meta[name='google-site-verification'], meta[name='msvalidate.01']").length, 0);
  const token = 'abc\"><script>bad()</script>';
  const result = await renderSeo({ googleVerification: token, bingVerification: "public-proof-value" });
  const $ = load(result.files.get("index.html"));
  assert.equal($("meta[name='google-site-verification']").attr("content"), token);
  assert.ok(!$("script").toArray().some((node) => $(node).text() === "bad()"));
});

test("mirrors/previews are noindex without excluding the real custom domain", async () => {
  const result = await renderSeo();
  const headers = result.files.get("_headers");
  assert.match(headers, /https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
  assert.match(headers, /https:\/\/:version\.:project\.pages\.dev\/\*/);
  assert.ok(!headers.includes("https://maxlananas.is-a.dev/*"));
  const redirects = result.files.get("_redirects").split("\n").filter((line) => line && !line.startsWith("#"));
  assert.ok(redirects.length > 20);
  for (const rule of redirects) {
    const [from, to, status] = rule.split(/\s+/);
    assert.notEqual(from, to);
    assert.equal(status, "301");
    assert.ok(!from.includes("*") && !from.startsWith("http"), "No SPA catch-all or unsupported domain rule");
    assert.ok(pages.some((p) => p.path === to));
  }
});

test("HTTP status, index aliases, trailing slash, query preservation and bot parity", async () => {
  const server = staticServer(process.cwd());
  await new Promise((resolve) => server.listen(0, "0.0.0.0", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ["/index.html", "/about", "/projects/homegui/index.html"]) {
      const response = await fetch(base + path + "?ref=test", { redirect: "manual" });
      assert.equal(response.status, 308);
      const expected = path.endsWith("index.html") ? path.slice(0, -10) : path + "/";
      assert.equal(response.headers.get("location"), expected + "?ref=test");
    }
    const missing = await fetch(base + "/missing/deep/project/", { redirect: "manual" });
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /noindex/);
    assert.equal((await fetch(base + "/CNAME", { redirect: "manual" })).status, 200);
    for (const path of ["/", "/about/", "/projects/homegui/", "/builds/page/7/"]) {
      const bodies = [];
      for (const agent of ["Mozilla/5.0", "Googlebot", "bingbot", "DuckDuckBot", "GPTBot"]) {
        const response = await fetch(base + path, { headers: { "user-agent": agent } });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("x-robots-tag"), null);
        bodies.push(await response.text());
      }
      assert.ok(bodies.every((body) => body === bodies[0]), `No cloaking for ${path}`);
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("development preview can be excluded from indexing with an HTTP header", async () => {
  const server = staticServer(process.cwd(), { noindex: true });
  await new Promise((resolve) => server.listen(0, "0.0.0.0", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
    assert.equal(response.headers.get("x-robots-tag"), "noindex");
    assert.match(await response.text(), /maxlananas\.is-a\.dev/);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test("live verification rejects stale HTML and checks the deployed routes without submissions", async () => {
  const { verifyLive } = await import("../../tools/verify-live.mjs");
  const server = staticServer(process.cwd());
  await new Promise((resolve) => server.listen(0, "0.0.0.0", resolve));
  try {
    const report = await verifyLive({ origin: `http://127.0.0.1:${server.address().port}/` });
    assert.equal(report.pages, 23);
    assert.equal(report.missingStatus, 404);
    await assert.rejects(verifyLive({ fetcher: async () => new Response("<title>Old site</title>") }), /old or unexpected deployment/);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
