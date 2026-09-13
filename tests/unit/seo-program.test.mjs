import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PROJECTS, FEATURED_PROJECT_SLUGS, developmentProjects } from "../../content/projects.js";
import { QUERY_MAP } from "../../content/seo-queries.js";
import { SEO_PROGRAM } from "../../tools/seo-lint.mjs";
import { sitePages } from "../../content/pages.js";
import { LANGS } from "../../content/i18n.js";
import { FILES } from "../../gallery-data.js";
import { captureDate, genericLabel } from "../../media-i18n.js";
import { renderedDiff } from "../../tools/seo-diff.mjs";

const root = resolve(import.meta.dirname, "..", "..");
const riptide = PROJECTS.find((project) => project.slug === "riptide");
const LOCALIZED = ["title", "description", "summary", "category", "intro", "features", "usage", "limits", "requirements", "faq", "imagesNote"];

test("Riptide is a curated web tool with its live URL and reciprocal links", () => {
  assert.ok(riptide, "Riptide must be part of the editorial selection");
  assert.equal(riptide.kind, "software");
  assert.equal(riptide.collection, "lab");
  assert.equal(riptide.application, "WebApplication");
  assert.equal(riptide.web, true);
  assert.equal(riptide.launch.url, "https://allofmyblocks.onrender.com/");
  assert.equal(riptide.source.url, riptide.launch.url);
  assert.deepEqual(riptide.interfaceLanguages, ["en", "fr"]);
  assert.ok(FEATURED_PROJECT_SLUGS.includes("riptide"), "Featured on the homepage");
  assert.ok(developmentProjects().some((project) => project.slug === "riptide"), "Listed in the development hub");
  assert.ok(riptide.images.every((name) => FILES.some((item) => item.name === name)));
  for (const slug of riptide.related) {
    assert.ok(PROJECTS.find((project) => project.slug === slug), `Related project exists: ${slug}`);
  }
  for (const slug of ["bte-distortion-calculator", "pineappleui", "le-mans"]) {
    assert.ok(PROJECTS.find((project) => project.slug === slug).related.includes("riptide"), `${slug} links back to Riptide`);
  }
});

test("Riptide copy is complete and genuinely translated in three languages", () => {
  for (const lang of LANGS) {
    for (const field of LOCALIZED) {
      const value = riptide[`${field}For`](lang);
      assert.ok(value && (Array.isArray(value) ? value.length : String(value).length > 12), `Missing ${lang} copy: ${field}`);
      if (lang !== "en" && field !== "faq") assert.notDeepEqual(value, riptide[field + "For"]("en"), `${field} must be translated into ${lang}`);
    }
    assert.equal(riptide.faqFor(lang).length, 4);
    for (const item of riptide.faqFor(lang)) {
      assert.ok(item.q.length > 12 && item.a.length > 60, "A published question needs a real answer");
    }
  }
  assert.ok(riptide.titleFor("en").length <= SEO_PROGRAM.budgets.titleMax);
  for (const lang of LANGS) assert.ok(riptide.descriptionFor(lang).length <= SEO_PROGRAM.budgets.descriptionMax);
});

test("every claim on the Riptide page comes from the tool itself", () => {
  const evidence = [riptide.requirements, riptide.usage, riptide.limits, ...riptide.intro, ...riptide.features].join(" ");
  for (const fact of ["512 MB", "15 minutes", "34 versions", "b1.8.1", "26.2", ".litematic", ".mcstructure", ".mcworld"]) {
    assert.ok(evidence.includes(fact), `Documented fact missing: ${fact}`);
  }
  assert.ok(!riptide.repo, "No public repository is claimed for a hosted tool");
  assert.ok(riptide.limits.includes("Mojang"), "Fan-tool disclaimer keeps the scope honest");
});

test("the query map covers every indexable page without cannibalisation", () => {
  const pages = sitePages().filter((page) => !page.noindex);
  const gallery = new Set(["/builds/", "/builds/page/2/", "/builds/page/3/", "/builds/page/4/", "/builds/page/5/", "/builds/page/6/", "/builds/page/7/"]);
  const claimed = new Map();
  for (const page of pages) {
    const en = page.enPath || page.path;
    const entry = QUERY_MAP.find((item) => item.path === en || (item.paginated && gallery.has(en) && gallery.has(item.path)));
    assert.ok(entry, `No target query for ${page.path}`);
    assert.ok(SEO_PROGRAM.clusters.some((cluster) => cluster.id === entry.cluster), `Unknown cluster ${entry.cluster}`);
    for (const lang of LANGS) {
      for (const query of entry.queries[lang]) {
        const scope = `${lang}:${query.toLowerCase()}`;
        assert.ok(!claimed.has(scope) || claimed.get(scope) === entry.path, `Query cannibalisation: ${query}`);
        claimed.set(scope, entry.path);
      }
    }
  }
  for (const cluster of SEO_PROGRAM.clusters) {
    const hub = sitePages().find((page) => page.path === cluster.hub);
    assert.ok(hub && !hub.noindex, `Cluster hub must be indexable: ${cluster.hub}`);
    assert.ok(QUERY_MAP.some((entry) => entry.cluster === cluster.id), `Cluster without pages: ${cluster.id}`);
  }
});

test("capture dates are parsed from the screenshot filenames in each language", () => {
  assert.equal(captureDate("2025-04-17_21.24.15.png", "en"), "17 April 2025");
  assert.equal(captureDate("2025-04-17_21.24.15.png", "fr"), "17 avril 2025");
  assert.equal(captureDate("2025-12-24_13.51.44.png", "es"), "24 de diciembre de 2025");
  assert.equal(captureDate("chateau_loire.png", "en"), "");
  assert.equal(captureDate("2025-13-45_99.99.99.png", "en"), "");
  assert.equal(genericLabel("en", { name: "chateau_loire.png" }, 81), "Minecraft portfolio screenshot 082");
});

test("every screenshot carries a unique, filled label in three languages", () => {
  for (const lang of LANGS) {
    const seen = new Set();
    FILES.forEach((item, index) => {
      const value = genericLabel(lang, item, index);
      assert.ok(!value.includes("{"), `Unfilled placeholder: ${value}`);
      assert.ok(value.length >= SEO_PROGRAM.budgets.minImageLabelLength, `Label too short: ${value}`);
      seen.add(value);
    });
    assert.equal(seen.size, FILES.length, `Unique ${lang} labels for the whole catalogue`);
  }
});

test("the published HTML exposes Riptide as a WebApplication with a visible FAQ", async () => {
  for (const [lang, path] of [["en", "projects/riptide/index.html"], ["fr", "fr/projects/riptide/index.html"], ["es", "es/projects/riptide/index.html"]]) {
    const html = await readFile(resolve(root, path), "utf8");
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
    const app = graph.find((node) => node["@type"] === "WebApplication");
    assert.equal(app["@id"], `https://maxlananas.is-a.dev/projects/riptide/#project`, lang);
    assert.equal(app.url, "https://allofmyblocks.onrender.com/");
    assert.equal(app.creator["@id"], "https://maxlananas.is-a.dev/#person");
    assert.equal(app.mainEntityOfPage["@id"], `https://maxlananas.is-a.dev/${path.replace("index.html", "")}#webpage`);
    assert.ok(app.featureList.length >= 6, lang);
    assert.equal(app.applicationCategory, riptide.categoryFor(lang));
    const faq = graph.find((node) => node["@type"] === "FAQPage");
    assert.equal(faq.mainEntity.length, 4, lang);
    assert.equal(faq.inLanguage, lang);
    for (const question of faq.mainEntity) {
      assert.ok(html.includes(question.name), `Question must be visible: ${question.name}`);
      assert.ok(html.includes(question.acceptedAnswer.text.slice(0, 40)), `Answer must be visible: ${question.name}`);
    }
    assert.ok(html.includes(`href="${riptide.launch.url}"`), "The live tool is linked from the page");
    assert.equal(graph.filter((node) => node["@type"] === "ImageObject").length, riptide.images.length, lang);
  }
});

test("the committed HTML matches a fresh render, with no stale generated page", async () => {
  const result = await renderedDiff({ directory: root });
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.stale, []);
  assert.deepEqual(result.changed.map((item) => item.file), []);
  assert.ok(result.generated >= 110);
});
