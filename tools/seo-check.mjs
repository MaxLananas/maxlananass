import { readFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { SITE, PAGE_SIZE, canonical } from "../content/site.js";
import { sitePages } from "../content/pages.js";
import { FILES } from "../gallery-data.js";
import { renderSeo, pageFile, pageImages, serviceWorkerRoutes } from "./seo-render.mjs";

const root = resolve(import.meta.dirname, "..");
const types = new Set(["Person", "Organization", "WebSite", "WebPage", "ProfilePage", "CollectionPage", "CreativeWork", "SoftwareSourceCode", "SoftwareApplication", "WebApplication", "Article", "ItemList", "BreadcrumbList", "ImageObject", "VideoObject"]);
const text = (value) => value.replace(/\s+/g, " ").trim();

export async function checkSeo({ directory = root, snapshots = resolve(directory) === root } = {}) {
  directory = resolve(directory);
  const pages = sitePages();
  const indexable = pages.filter((page) => !page.noindex);
  const documents = new Map();
  const titles = new Set(), descriptions = new Set(), galleryOriginals = new Set();
  const adjacency = new Map();
  let links = 0, images = 0;
  for (const page of pages) {
    const html = await readFile(resolve(directory, pageFile(page.path)), "utf8");
    assert.ok(!/\{\{[A-Z_]+\}\}/.test(html), `Unrendered placeholder: ${page.path}`);
    documents.set(page.path, load(html));
  }
  async function localResource(url, from) {
    if (/^(data:|blob:|mailto:|tel:)/.test(url)) return;
    const target = new URL(url, canonical(from));
    if (target.origin !== new URL(SITE.url).origin) return;
    const path = target.pathname;
    const file = path.endsWith("/") ? pageFile(path) : path.replace(/^\//, "");
    const metadata = await stat(resolve(directory, file)).catch(() => null);
    assert.ok(metadata?.isFile(), `Missing resource/link: ${from} → ${url}`);
  }
  for (const page of pages) {
    const $ = documents.get(page.path);
    const title = text($("title").text());
    assert.equal($("title").length, 1, `One title: ${page.path}`);
    assert.equal(title, page.title);
    assert.ok(!titles.has(title), `Duplicate title: ${title}`); titles.add(title);
    assert.equal($("meta[name=description]").length, 1);
    const description = $("meta[name=description]").attr("content");
    assert.equal(description, page.description);
    assert.ok(description.length >= 60 && description.length <= 220, `Description length: ${page.path}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${page.path}`); descriptions.add(description);
    assert.equal($("h1").length, 1, `One H1: ${page.path}`);
    assert.equal(text($("h1").text()), page.heading);
    assert.equal($("html").attr("lang"), page.lang);
    assert.equal($("meta[charset]").length, 1);
    assert.equal($("meta[name=viewport]").length, 1);
    assert.equal($("meta[name=keywords]").length, 0, "No keyword-stuffing metadata");
    const robots = $("meta[name=robots]").attr("content") || "";
    if (page.noindex) { assert.match(robots, /noindex/); assert.equal($("link[rel=canonical]").length, 0); }
    else { assert.ok(!robots.includes("noindex")); assert.equal($("link[rel=canonical]").length, 1); assert.equal($("link[rel=canonical]").attr("href"), canonical(page.path)); }
    for (const property of ["og:title", "og:description", "og:url", "og:image", "og:image:alt", "og:image:width", "og:image:height", "og:site_name"]) assert.equal($(`meta[property="${property}"]`).length, 1, `${property}: ${page.path}`);
    assert.equal($("meta[property='og:url']").attr("content"), canonical(page.path));
    assert.equal($("meta[property='og:site_name']").attr("content"), SITE.name);
    assert.equal($("meta[name='twitter:card']").attr("content"), "summary_large_image");
    assert.ok($("meta[name='twitter:image:alt']").attr("content"));
    await localResource($("meta[property='og:image']").attr("content"), page.path);
    const alternates = $("link[hreflang]");
    assert.equal(alternates.length, page.alternates ? 3 : 0);
    for (const alternate of alternates.toArray()) {
      const lang = $(alternate).attr("hreflang"), href = $(alternate).attr("href");
      const target = documents.get(new URL(href).pathname);
      assert.ok(target, "Alternate page must exist");
      assert.ok(target(`link[hreflang='${page.lang}'][href='${canonical(page.path)}']`).length, "Reciprocal hreflang");
      if (lang !== "x-default") assert.equal(target("html").attr("lang"), lang);
    }
    const ld = $("script[type='application/ld+json']");
    assert.equal(ld.length, 1);
    const graph = JSON.parse(ld.text())["@graph"];
    assert.ok(Array.isArray(graph));
    const ids = new Set(graph.map((node) => node["@id"]));
    assert.equal(ids.size, graph.length, "No conflicting node identifiers");
    for (const node of graph) {
      assert.ok(types.has(node["@type"]), `Unsupported or decorative schema type: ${node["@type"]}`);
      assert.ok(node["@id"].startsWith(SITE.url));
      assert.ok(!node.aggregateRating && !node.review && !node.interactionStatistic && !node.offers, "No invented ratings/offers/metrics");
      if (node.codeRepository) assert.equal(node["@type"], "SoftwareSourceCode");
      if (node["@type"] === "Article") {
        assert.equal(node.headline, page.heading); assert.equal(node.author["@id"], canonical("/#person"));
        assert.ok($(`time[datetime='${node.datePublished}']`).length, "Article date is visible and real");
      }
    }
    const person = graph.find((node) => node["@type"] === "Person");
    assert.equal(person["@id"], canonical("/#person")); assert.equal(person.name, SITE.name);
    assert.deepEqual(person.sameAs, [SITE.github, SITE.instagram, SITE.modrinth]);
    assert.ok(!person.address && !person.birthDate && !person.worksFor && !person.memberOf, "Do not invent identity or an official role");
    const entity = graph.find((node) => node["@id"] === canonical(page.path) + "#webpage");
    if (page.type === "ProfilePage") assert.equal(entity.mainEntity["@id"], person["@id"]);
    const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList");
    if (!page.home) {
      const visible = $(".breadcrumbs li").toArray().map((li) => text($(li).text()));
      assert.deepEqual(breadcrumb.itemListElement.map((item) => item.name), visible);
      assert.deepEqual(breadcrumb.itemListElement.map((item) => item.position), visible.map((_, i) => i + 1));
      assert.equal(breadcrumb.itemListElement.at(-1).item, canonical(page.path));
    } else assert.equal(breadcrumb, undefined);
    const edges = new Set();
    for (const anchor of $("a[href]").toArray()) {
      const href = $(anchor).attr("href");
      assert.ok(text($(anchor).text()) || $(anchor).attr("aria-label") || $(anchor).find("img[alt]").length, `Unnamed link ${href}`);
      if (!/^https?:|^\/|^#|^\./.test(href)) continue;
      const url = new URL(href, canonical(page.path));
      if (url.origin !== new URL(SITE.url).origin) continue;
      links++;
      await localResource(href, page.path);
      if (url.pathname.endsWith("/")) {
        const doc = documents.get(url.pathname);
        assert.ok(doc, `Non-canonical internal page: ${href}`);
        edges.add(url.pathname);
        if (url.hash) assert.ok(doc(`[id='${decodeURIComponent(url.hash.slice(1))}']`).length, `Broken fragment ${page.path} → ${href}`);
      }
      assert.ok(!/\/index\.html$/.test(url.pathname), "Internal links must use canonical routes");
    }
    adjacency.set(page.path, edges);
    for (const resource of $("script[src], link[rel=stylesheet], link[rel=icon], link[rel=manifest], link[rel=modulepreload], link[rel=preload]").toArray()) await localResource($(resource).attr("src") || $(resource).attr("href"), page.path);
    const docImages = $("img").toArray().filter((img) => !$(img).closest("#lightbox").length);
    for (const img of docImages) {
      images++;
      assert.ok($(img).attr("src"), "Static image must have a real src");
      assert.ok($(img).attr("alt") !== undefined);
      assert.ok(Number($(img).attr("width")) > 0 && Number($(img).attr("height")) > 0, "Reserve image dimensions");
      await localResource($(img).attr("src"), page.path);
    }
    if (page.galleryPage) {
      const photos = $(".photo-card img").toArray();
      assert.ok(photos.length > 0 && photos.length <= PAGE_SIZE);
      for (const img of photos) {
        const original = $(img).attr("data-original");
        assert.ok(!galleryOriginals.has(original), "A screenshot must not appear on multiple pagination pages");
        galleryOriginals.add(original);
      }
      assert.equal($(photos[0]).attr("loading"), "eager");
      assert.equal($(photos[0]).attr("fetchpriority"), "high");
      for (const img of photos.slice(1)) assert.equal($(img).attr("loading"), "lazy");
      assert.equal($(".pagination").first().find("a[aria-current=page]").length, 1);
    }
  }
  assert.equal(galleryOriginals.size, FILES.length, "Every original is crawlable without JavaScript");
  const reachable = new Set(["/"]), pending = ["/"];
  while (pending.length) for (const next of adjacency.get(pending.shift()) || []) if (!reachable.has(next)) { reachable.add(next); pending.push(next); }
  for (const page of indexable) assert.ok(reachable.has(page.path), `Orphan page: ${page.path}`);

  const sitemap = load(await readFile(resolve(directory, "sitemap.xml"), "utf8"), { xml: true });
  const locations = sitemap("url > loc").toArray().map((node) => sitemap(node).text());
  assert.deepEqual(locations.sort(), indexable.map((page) => canonical(page.path)).sort());
  assert.equal(sitemap("priority, changefreq").length, 0);
  for (const date of sitemap("lastmod").toArray()) assert.equal(sitemap(date).text(), SITE.reviewed, "No fabricated freshness on every build");
  const imageMap = load(await readFile(resolve(directory, "sitemap-images.xml"), "utf8"), { xml: true });
  for (const node of imageMap("url").toArray()) {
    const path = new URL(imageMap(node).children("loc").text()).pathname;
    const page = pages.find((p) => p.path === path);
    assert.ok(page && !page.noindex);
    const $ = documents.get(path);
    const actual = new Set($(".photo-card img, img[data-project-media]").toArray().map((img) => canonical($(img).attr("src"))));
    const listed = imageMap(node).find("image\\:loc").toArray().map((img) => imageMap(img).text());
    assert.equal(listed.length, pageImages(page).length);
    for (const url of listed) assert.ok(actual.has(url), `Image sitemap must match visible HTML: ${url}`);
  }
  const robots = await readFile(resolve(directory, "robots.txt"), "utf8");
  assert.ok(robots.includes("User-agent: *") && robots.includes("Allow: /"));
  assert.ok(!/Disallow:\s*\/(?:$|\s*$|assets|search|script|image-|style)/m.test(robots), "Do not block the site, rendering resources or noindex search page");
  assert.ok(robots.includes(canonical("/sitemap-images.xml")));
  const error = load(await readFile(resolve(directory, "404.html"), "utf8"));
  assert.match(error("meta[name=robots]").attr("content"), /noindex/);
  assert.equal(error("link[rel=canonical]").length, 0, "404 must not canonicalize to the homepage");
  if (snapshots) {
    const expected = await renderSeo();
    for (const [file, value] of expected.files) assert.equal(await readFile(resolve(directory, file), "utf8"), value, `Stale generated file: ${file}. Run npm run seo:render.`);
    const sw = await readFile(resolve(root, "sw.js"), "utf8");
    assert.equal(serviceWorkerRoutes(sw), sw, "Regenerate the service-worker page allowlist");
  }
  return { pages: pages.length, indexable: indexable.length, images, originalScreenshots: galleryOriginals.size, internalLinks: links, orphans: 0 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const directory = args.includes("--dir") ? args[args.indexOf("--dir") + 1] : root;
  console.log("SEO checks passed:", await checkSeo({ directory }));
}
