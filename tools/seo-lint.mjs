import assert from "node:assert/strict";
import program from "../site-package.json" with { type: "json" };
import { QUERY_MAP } from "../content/seo-queries.js";
import { LABELS } from "../media-i18n.js";
import { FILES } from "../gallery-data.js";
import { LANGS, pathFor, enPath, label } from "../content/i18n.js";
import { PAGE_SIZE } from "../content/site.js";

const STOPWORDS = new Set(["the", "and", "for", "with", "from", "that", "this", "into", "over", "under", "your", "you", "are", "was", "were", "not", "but", "all", "can", "how", "what", "when", "where", "which", "who", "why", "does", "make", "made", "use", "using", "used", "about", "plus", "sans", "avec", "pour", "dans", "sur", "par", "une", "des", "les", "del", "los", "las", "con", "por", "para", "entre", "como", "when", "than", "then", "their", "there", "these", "those", "have", "has", "had", "will", "would", "should", "could"]);
const normalize = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const significant = (value) => normalize(value).split(" ").filter((token) => token.length >= 4 && !STOPWORDS.has(token));
const similar = (a, b) => a === b || (a.length >= 5 && b.startsWith(a.slice(0, 5))) || (b.length >= 5 && a.startsWith(b.slice(0, 5)));

export const SEO_PROGRAM = program;
export const galleryPaths = () => Array.from({ length: Math.ceil(FILES.length / PAGE_SIZE) }, (_, i) => i === 0 ? "/builds/" : `/builds/page/${i + 1}/`);

function entryFor(enPath) {
  return QUERY_MAP.find((entry) => entry.path === enPath || (entry.paginated && galleryPaths().includes(enPath) && galleryPaths().includes(entry.path)));
}

export function lintSeoProgram({ pages, documents, adjacency }) {
  const budgets = program.budgets;
  const indexable = pages.filter((page) => !page.noindex);
  const byPath = new Map(pages.map((page) => [page.path, page]));
  const text = (value) => String(value).replace(/\s+/g, " ").trim();
  const findings = [];

  assert.deepEqual([...program.locales].sort(), [...LANGS].sort(), "site-package locales must match the rendered languages");
  for (const cluster of program.clusters) {
    assert.ok(byPath.get(cluster.hub) && !byPath.get(cluster.hub).noindex, `Cluster hub must exist and be indexable: ${cluster.id} → ${cluster.hub}`);
  }
  for (const entry of QUERY_MAP) {
    assert.ok(program.clusters.some((cluster) => cluster.id === entry.cluster), `Unknown cluster: ${entry.cluster} for ${entry.path}`);
    assert.ok(byPath.get(entry.path), `Query map targets a page that does not exist: ${entry.path}`);
    for (const lang of LANGS) assert.ok(entry.queries[lang]?.length, `Missing ${lang} queries for ${entry.path}`);
  }

  const claimed = new Map();
  for (const page of indexable) {
    const en = page.enPath || enPath(page.path);
    const entry = entryFor(en);
    if (!entry) findings.push(`No target query for ${page.path}`);
    else {
      const local = entry.queries[page.lang] || [];
      for (const query of local) {
        const scope = `${page.lang}:${normalize(query)}`;
        if (claimed.has(scope) && claimed.get(scope) !== entry.path) findings.push(`Query cannibalisation (${page.lang}): “${query}” targets ${claimed.get(scope)} and ${entry.path}`);
        claimed.set(scope, entry.path);
      }
      const haystack = significant([page.title, page.heading, page.description].join(" "));
      for (const query of local) {
        const wanted = significant(query);
        assert.ok(wanted.length > 0, `Query without significant tokens: ${query}`);
        const missed = wanted.filter((token) => !haystack.some((candidate) => similar(token, candidate)));
        if (missed.length > budgets.maxUnmatchedQueryTokens) findings.push(`Metadata does not target “${query}” on ${page.path} (missing: ${missed.join(", ")})`);
      }
    }
  }
  const coverage = indexable.filter((page) => entryFor(page.enPath || page.path)).length / indexable.length;
  assert.ok(coverage >= budgets.minQueryCoverage, `Query coverage ${(coverage * 100).toFixed(1)}% below ${(budgets.minQueryCoverage * 100).toFixed(0)}%`);

  const clusterReport = [];
  for (const cluster of program.clusters) {
    const members = QUERY_MAP.filter((entry) => entry.cluster === cluster.id && entry.path !== cluster.hub);
    const stats = { id: cluster.id, hub: cluster.hub, pages: 0, hubLinks: 0, backLinks: 0 };
    for (const lang of LANGS) {
      const hub = pathFor(lang, cluster.hub);
      const hubEdges = adjacency.get(hub) || new Set();
      const locals = members.flatMap((entry) => entry.paginated ? galleryPaths().slice(1).map((path) => pathFor(lang, path)) : [pathFor(lang, entry.path)]);
      const topical = members.filter((entry) => !entry.paginated).map((entry) => pathFor(lang, entry.path));
      for (const local of locals) {
        stats.pages++;
        const edges = adjacency.get(local) || new Set();
        if (edges.has(hub)) stats.backLinks++;
        else findings.push(`${local} does not link to its cluster hub ${hub}`);
      }
      for (const local of topical) if (hubEdges.has(local)) stats.hubLinks++;
    }
    if (members.length) {
      const ratio = stats.backLinks / stats.pages;
      assert.ok(ratio >= 0.95, `Cluster ${cluster.id}: only ${(ratio * 100).toFixed(0)}% of its pages link back to ${cluster.hub}`);
    }
    if (members.filter((entry) => !entry.paginated).length) {
      const ratio = stats.hubLinks / (members.filter((entry) => !entry.paginated).length * LANGS.length);
      assert.ok(ratio >= 0.5, `Cluster ${cluster.id}: hub ${cluster.hub} links to ${(ratio * 100).toFixed(0)}% of its pages`);
    }
    clusterReport.push(stats);
  }

  const depth = new Map([["/", 0]]);
  const pending = ["/"];
  while (pending.length) {
    const current = pending.shift();
    for (const next of adjacency.get(current) || []) {
      if (!depth.has(next)) { depth.set(next, depth.get(current) + 1); pending.push(next); }
    }
  }
  let maxDepth = 0;
  for (const page of indexable) {
    const distance = depth.get(page.path);
    assert.ok(distance !== undefined, `Unreachable page in the internal graph: ${page.path}`);
    assert.ok(distance <= budgets.maxLinkDepth, `${page.path} sits ${distance} clicks from the homepage (budget ${budgets.maxLinkDepth})`);
    maxDepth = Math.max(maxDepth, distance);
  }
  for (const page of indexable) {
    const internal = (documents.get(page.path)("a[href]").toArray()).filter((anchor) => {
      const href = documents.get(page.path)(anchor).attr("href");
      return /^\/|^https?:\/\/[^/]*maxlananas\.is-a\.dev/.test(href) && !href.startsWith("//");
    }).length;
    assert.ok(internal >= budgets.minInternalLinksPerPage, `${page.path} carries only ${internal} internal links`);
  }

  const labelled = FILES.filter((item) => Object.values(LABELS).some((labels) => labels[item.name])).length;
  const labelCoverage = labelled / FILES.length;
  assert.ok(labelCoverage >= budgets.minImageLabelCoverage, `Specific image labels cover ${(labelCoverage * 100).toFixed(0)}% of the catalogue`);
  for (const language of LANGS) {
    const seen = new Map();
    FILES.forEach((item, index) => {
      const value = label(language, item, index);
      assert.ok(value.length >= budgets.minImageLabelLength, `Image label too short (${language}): ${item.name}`);
      assert.ok(!/\{[a-z]+\}/.test(value), `Unfilled placeholder in ${language} label for ${item.name}`);
      if (seen.has(value)) findings.push(`Duplicate ${language} image label “${value}”: ${seen.get(value)} and ${item.name}`);
      seen.set(value, item.name);
    });
    assert.equal(seen.size, FILES.length, `Every ${language} image label must be unique`);
  }

  const published = new Set(Object.values(program.entities));
  const nodes = new Map();
  for (const page of pages) {
    const $ = documents.get(page.path);
    const graph = JSON.parse($('script[type="application/ld+json"]').text())["@graph"];
    for (const node of graph) {
      nodes.set(node["@id"], page.path);
      published.add(node["@id"]);
    }
  }
  let references = 0;
  for (const page of pages) {
    const $ = documents.get(page.path);
    const graph = JSON.parse($('script[type="application/ld+json"]').text())["@graph"];
    const walk = (value) => {
      if (Array.isArray(value)) return value.forEach(walk);
      if (!value || typeof value !== "object") return;
      if (typeof value["@id"] === "string") {
        references++;
        assert.ok(published.has(value["@id"]), `Dangling entity reference on ${page.path}: ${value["@id"]}`);
      }
      for (const [key, item] of Object.entries(value)) if (key !== "@id") walk(item);
    };
    graph.forEach(walk);
    for (const node of graph) {
      if (node["@type"] === "FAQPage") {
        const visible = new Set($(".faq details summary").toArray().map((item) => normalize(text($(item).text()))));
        assert.ok(visible.size >= node.mainEntity.length, `FAQ structured data on ${page.path} has no visible counterpart`);
        for (const question of node.mainEntity) {
          assert.ok(visible.has(normalize(question.name)), `FAQ question not visible on ${page.path}: ${question.name}`);
          assert.equal(question["@type"], "Question");
          assert.equal(question.acceptedAnswer["@type"], "Answer");
          assert.ok(question.acceptedAnswer.text.length >= 40, `Thin FAQ answer on ${page.path}: ${question.name}`);
        }
      }
      if (node["@type"] === "WebApplication") {
        assert.ok(node.url.startsWith("https://"), `Web application needs its live https URL: ${page.path}`);
        assert.ok(node.featureList?.length >= 3, `Web application needs a real feature list: ${page.path}`);
        const live = $("a[href]").toArray().some((anchor) => $(anchor).attr("href") === node.url);
        assert.ok(live, `Web application URL is not visible to visitors: ${page.path} → ${node.url}`);
      }
    }
  }

  assert.deepEqual(findings, []);
  return {
    clusters: clusterReport.length,
    queries: claimed.size,
    queryCoverage: Number(coverage.toFixed(3)),
    maxLinkDepth: maxDepth,
    entityReferences: references,
    labelledImages: `${labelled}/${FILES.length}`
  };
}
