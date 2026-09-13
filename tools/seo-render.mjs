import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { SITE, PAGE_SIZE, canonical, galleryPath, projectPath } from "../content/site.js";
import { sitePages } from "../content/pages.js";
import { PROJECTS, developmentProjects } from "../content/projects.js";
import { projectMedia, iprofVideo, mediaData, mediaText } from "./project-content.mjs";
import { caseMedia } from "./iprof-case-study.mjs";
import { contentVersion } from "./content-version.mjs";
import { brandIcon } from "./brand.mjs";
import { FILES, CREDITS } from "../gallery-data.js";
import { escape, helpers, pageContent, homeIntro, homeProjects, homeBlocks } from "./seo-content.mjs";
import { ui, fill } from "../ui.js";
import { copy, label, LANGS, LOCALES, LANG_LABEL, pathFor, enPath } from "../content/i18n.js";

const root = resolve(import.meta.dirname, "..");
const ARCHIVE_RELEASE = "https://github.com/MaxLananas/Asset-Portfolio/releases/tag/images-v1";
export const pageFile = (path) => path === "/" ? "index.html" : path.replace(/^\//, "") + "index.html";
const PERSON = canonical("/#person");
const WEBSITE = canonical("/#website");

const imageFiles = (page) => page.galleryPage
  ? FILES.slice((page.galleryPage - 1) * PAGE_SIZE, page.galleryPage * PAGE_SIZE)
  : [...(page.project?.images || []).map((name) => FILES.find((item) => item.name === name)), ...(page.caseStudy ? caseMedia(page) : page.project?.media || []).map((item) => ({ ...item, projectMedia: true }))];
const imageSource = (item, h) => item.projectMedia ? h.mediaData(item.key).src : h.imageData(item).src;
const imageTitle = (item, h, name = "") => item.projectMedia ? mediaText(h.lang, item, "title", name) : label(h.lang, item, FILES.findIndex((file) => file.name === item.name));
const imageCaption = (item, h, name = "") => item.projectMedia ? mediaText(h.lang, item, "alt", name) || mediaText(h.lang, item, "title", name) : imageTitle(item, h, name);
const articlePage = (page) => page.type === "Article" || page.caseStudy;
const enRoute = (page) => page.enPath || enPath(page.path);
const languageLinks = (page) => {
  if (!page.alternates?.length) return [];
  const fallback = page.alternates.find((entry) => entry.lang === "en") || page.alternates[0];
  return [...page.alternates, { lang: "x-default", path: fallback.path }];
};
const socialPath = (page) => projectMedia[page.project?.social || page.project?.cover]?.social || "assets/social/portfolio.png";

export const pageImages = imageFiles;

function socialCard(page, h) {
  const path = socialPath(page);
  const curated = projectMedia[page.project?.social || page.project?.cover]?.social;
  const fallback = { href: canonical(path), type: path.endsWith(".jpg") ? "image/jpeg" : "image/png", width: 1200, height: 630 };
  if (curated) return fallback;
  const first = imageFiles(page)[0];
  if (!first) return fallback;
  if (first.projectMedia) {
    const data = mediaData(first.key);
    return { href: canonical(data.src), type: "image/webp", width: data.width, height: data.height };
  }
  const meta = h?.manifest?.[first.name];
  if (!meta?.widths?.length) return fallback;
  const width = meta.widths.filter((value) => value <= 1600).pop() || meta.widths[0];
  const height = Math.max(1, Math.round(meta.height * (width / meta.width)));
  return { href: canonical(`/${meta.base}-${width}.webp`), type: "image/webp", width, height };
}

function breadcrumbs(page, pages) {
  if (page.home) return [];
  const l = page.lang;
  const entries = [{ name: ui(l, "crumbHome"), url: canonical(pathFor(l, "/")), route: "/" }];
  if (page.parent) {
    const parent = pages.find((p) => p.path === page.parent);
    if (!parent) throw new Error(`Missing parent ${page.parent}`);
    entries.push({ name: parent.heading, url: canonical(parent.path), route: parent.enPath || enPath(parent.path) });
  }
  entries.push({ name: page.heading, url: canonical(page.path), route: enRoute(page) });
  return entries;
}

function languageNav(page, h) {
  const links = languageLinks(page).filter((entry) => entry.lang !== "x-default");
  return `<nav class="language-nav" aria-label="${escape(ui(page.lang, "langAria"))}">${links.map((entry) => `<a href="${escape(h.local(entry.path))}" lang="${entry.lang}" hreflang="${entry.lang}"${entry.lang === page.lang ? ' aria-current="true"' : ""}>${escape(LANG_LABEL[entry.lang])}</a>`).join(" · ")}</nav>`;
}

export function schemaFor(page, pages, h) {
  const l = h?.lang || page.lang || "en";
  const url = canonical(page.path);
  const en = enRoute(page);
  const person = {
    "@type": "Person", "@id": PERSON, name: SITE.name, url: SITE.url,
    description: ui(l, "schemaPersonDescription"),
    image: canonical("/apple-touch-icon.png"),
    mainEntityOfPage: { "@id": canonical(pathFor(l, "/about/")) + "#webpage" },
    sameAs: [SITE.github, SITE.instagram, SITE.modrinth], alternateName: "maxlananass",
    knowsAbout: ui(l, "schemaKnowsAbout").split(","),
    contactPoint: { "@type": "ContactPoint", contactType: ui(l, "schemaContactType"), url: SITE.discord }
  };
  const graph = [person, { "@type": "WebSite", "@id": WEBSITE, url: SITE.url, name: SITE.name, alternateName: "MaxLananas Portfolio", inLanguage: [...LANGS], publisher: { "@id": PERSON } }];
  const webPage = {
    "@type": articlePage(page) ? "WebPage" : page.type,
    "@id": url + "#webpage", url, name: page.title, description: page.description,
    inLanguage: page.lang, dateModified: page.modified, lastReviewed: page.reviewed, isPartOf: { "@id": WEBSITE }, about: { "@id": PERSON }
  };
  const bte = en === "/buildtheearth/" || page.project?.bte;
  if (bte) {
    const initiative = { "@type": "Organization", "@id": canonical("/buildtheearth/#initiative"), name: "BuildTheEarth", url: SITE.bte };
    graph.push(initiative);
    webPage.about = [{ "@id": PERSON }, { "@id": initiative["@id"] }];
  }
  const crumbs = breadcrumbs(page, pages);
  if (crumbs.length) {
    graph.push({ "@type": "BreadcrumbList", "@id": url + "#breadcrumb", itemListElement: crumbs.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })) });
    webPage.breadcrumb = { "@id": url + "#breadcrumb" };
  }
  if (page.type === "ProfilePage") webPage.mainEntity = { "@id": PERSON };
  if (page.project) {
    const p = page.project;
    const projectURL = canonical(projectPath(p.slug));
    const work = { "@id": projectURL + "#project", "@type": p.kind === "software" && p.repo ? "SoftwareSourceCode" : "CreativeWork",
      name: p.name, url: projectURL, description: p.summaryFor(l),
      ...(p.upstream || p.kind === "build" ? { contributor: { "@id": PERSON } } : { creator: { "@id": PERSON } }) };
    if (p.repo && p.kind === "software") {
      work.codeRepository = p.repo;
      if (p.revision && p.evidenceFile) work.citation = p.repo + "/blob/" + p.revision + "/" + p.evidenceFile;
    }
    if (p.source?.url) work.citation = p.source.url;
    if (p.kind === "design") work.genre = ui(l, "genreDesign");
    if (p.bte) work.about = { "@id": canonical("/buildtheearth/#initiative") };
    if (p.kind === "software" && p.repo) work.programmingLanguage = p.modrinth ? "Java" : p.language;
    if (p.upstream) { work.isBasedOn = p.upstream; work.creditText = ui(l, "schemaCreditUpstream"); }
    if (p.kind === "build") work.creditText = ui(l, "schemaCreditBte");
    if (p.kind === "documentation") { work.inLanguage = "fr"; work.genre = ui(l, "schemaGenreUnofficial"); }
    if (p.kind === "software") work.genre = p.categoryFor(l);
    work.inLanguage = work.inLanguage || l;
    graph.push(work);
    webPage.mainEntity = { "@id": work["@id"] };
  }
  const photos = imageFiles(page);
  if (photos.length) {
    const references = [];
    for (const item of photos) {
      const index = FILES.findIndex((file) => file.name === item.name);
      const credit = CREDITS[item.credit];
      const id = url + (item.projectMedia ? `#media-${item.key}` : `#image-${index + 1}`);
      const title = imageTitle(item, h || helpers("/", {}, l), page.project?.name);
      const dimensions = item.projectMedia ? mediaData(item.key) : h?.manifest?.[item.name];
      graph.push({ "@type": "ImageObject", "@id": id, contentUrl: canonical(imageSource(item, h || helpers("/", {}, l))),
        name: title, caption: imageCaption(item, h || helpers("/", {}, l), page.project?.name),
        ...(dimensions ? { width: dimensions.width, height: dimensions.height } : {}),
        creditText: item.projectMedia ? ui(l, "creditProjectMedia") : credit ? `${copy(l, "credits", item.credit).text} ${copy(l, "credits", item.credit).linkText}` : ui(l, "creditDefault"),
        isPartOf: { "@id": webPage["@id"] } });
      references.push({ "@id": id });
    }
    webPage.hasPart = references;
  }
  if (page.project?.video) {
    const id = canonical("/projects/iprof-redesign/#video");
    graph.push({ "@type": "MediaObject", "@id": id,
      name: ui(l, "schemaVideoName"), description: ui(l, "schemaVideoDescription"),
      contentUrl: canonical(iprofVideo.file), thumbnailUrl: canonical(iprofVideo.poster),
      encodingFormat: "video/mp4", duration: `PT${iprofVideo.duration}S`, width: iprofVideo.width, height: iprofVideo.height,
      inLanguage: l,
      creator: { "@id": PERSON }, isPartOf: { "@id": canonical("/projects/iprof-redesign/#project") } });
    webPage.hasPart = [...(webPage.hasPart || []), { "@id": id }];
  }

  const selected = en === "/projects/" ? PROJECTS : en === "/development/" ? developmentProjects() : en === "/buildtheearth/" ? PROJECTS.filter((p) => p.bte) : [];
  if (selected.length) {
    graph.push({ "@type": "ItemList", "@id": url + "#projects", name: page.heading,
      itemListElement: selected.map((p, index) => ({ "@type": "ListItem", position: index + 1, name: p.name, url: canonical(projectPath(p.slug)) })) });
    webPage.mainEntity = { "@id": url + "#projects" };
  }
  if (articlePage(page)) {
    if (!page.published) throw new Error(`An article needs its real publication date: ${page.path}`);
    const citation = page.caseStudy ? [page.project.source.url] : ["homegui", "tracebte", "railway-tools-axiom", "bte-distortion-calculator", "pineappleui", "builders-utilities-bt-corsica"]
      .map((slug) => PROJECTS.find((p) => p.slug === slug)).map((p) => p.source?.url || p.repo).filter(Boolean);
    const article = { "@type": "Article", "@id": url + "#article", headline: page.heading, description: page.description,
      datePublished: page.published, dateModified: page.modified, author: { "@id": PERSON }, publisher: { "@id": PERSON },
      mainEntityOfPage: { "@id": webPage["@id"] }, inLanguage: page.lang, image: socialCard(page, h).href, citation };
    if (page.caseStudy) {
      article.about = { "@id": canonical(projectPath(page.project.slug)) + "#project" };
      article.associatedMedia = { "@id": canonical("/projects/iprof-redesign/#video") };
    }
    article.workTranslation = languageLinks(page).filter((entry) => entry.lang !== page.lang && entry.lang !== "x-default").map((entry) => ({ "@id": canonical(entry.path) + "#article" }));
    graph.push(article);
    webPage.mainEntity = { "@id": article["@id"] };
  }
  graph.push(webPage);
  return { "@context": "https://schema.org", "@graph": graph };
}

function headFor(page, pages, h, options) {
  const l = page.lang;
  const url = canonical(page.path);
  const meta = (key, value, property = false) => `<meta ${property ? "property" : "name"}="${key}" content="${escape(value)}">`;
  const card = socialCard(page, h);
  const socialAlt = page.project ? ui(l, "ogProjectAlt", { name: page.project.name }) : ui(l, "ogDefaultAlt");
  const graph = JSON.stringify(schemaFor(page, pages, h)).replace(/</g, "\\u003c");
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(page.title)}</title>
${meta("description", page.description)}
${meta("robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")}
${page.noindex ? "" : `<link rel="canonical" href="${url}">`}
${meta("author", SITE.name)}
${meta("portfolio-content-version", options.contentVersion)}
${meta("theme-color", "#0a0a0b")}
${meta("color-scheme", "dark")}
${meta("og:type", articlePage(page) ? "article" : "website", true)}
${meta("og:url", url, true)}
${meta("og:site_name", SITE.name, true)}
${meta("og:title", page.title, true)}
${meta("og:description", page.description, true)}
${meta("og:locale", LOCALES[l], true)}
${LANGS.filter((entry) => entry !== l).map((entry) => meta("og:locale:alternate", LOCALES[entry], true)).join("\n")}
${meta("og:image", card.href, true)}
${meta("og:image:type", card.type, true)}
${meta("og:image:width", String(card.width), true)}
${meta("og:image:height", String(card.height), true)}
${meta("og:image:alt", socialAlt, true)}
${meta("twitter:card", "summary_large_image")}
${meta("twitter:title", page.title)}
${meta("twitter:description", page.description)}
${meta("twitter:image", card.href)}
${meta("twitter:image:alt", socialAlt)}
${articlePage(page) ? meta("article:published_time", page.published, true) + "\n" + meta("article:modified_time", page.modified, true) + "\n" + meta("article:author", canonical(pathFor(l, "/about/")), true) : ""}
${languageLinks(page).map(({ lang, path }) => `<link rel="alternate" hreflang="${lang}" href="${canonical(path)}">`).join("\n")}
${options.googleVerification ? meta("google-site-verification", options.googleVerification) : ""}
${options.bingVerification ? meta("msvalidate.01", options.bingVerification) : ""}
<link rel="icon" href="${h.local("favicon.ico")}" sizes="any">
<link rel="icon" href="${h.local("assets/icons/favicon-96.png")}" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="${h.local("apple-touch-icon.png")}" sizes="180x180">
<link rel="manifest" href="${h.local("manifest.json")}">
<link rel="preload" href="${h.local(options.font)}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${h.local(options.styles)}">
${page.home && !options.optimized ? '<link rel="preconnect" href="https://wsrv.nl" crossorigin>' : ""}
${(page.home ? options.preloads : options.pagePreloads).map((path) => `<link rel="modulepreload" href="${h.local(path)}">`).join("\n")}
<script type="module" src="${h.local(page.home ? options.app : options.pageScript)}"></script>
<script type="application/ld+json">${graph}</script>`;
}

function frame(page, pages, body, h, head) {
  const l = page.lang;
  const t = (key, values) => ui(l, key, values);
  if (page.project || page.type === "Article") {
    const headings = [];
    body = body.replace(/<h2>([^<]+)<\/h2>/g, (_, title) => {
      const id = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, title });
      return `<h2 id="${id}">${title}</h2>`;
    });
    body = `<details class="contents"><summary>${escape(t("onThisPage"))}</summary><nav aria-label="${escape(t("tocAria"))}"><ul>${headings.map(({ id, title }) => `<li><a href="#${id}">${title}</a></li>`).join("")}</ul></nav></details>` + body;
  }
  const crumbs = breadcrumbs(page, pages);
  return `<!DOCTYPE html>
<!-- Generated by tools/seo-render.mjs. Edit content/ and templates/, not this snapshot. -->
<html lang="${l}" data-base="${h.local("")}"><head>${head}</head><body class="document-page${page.caseStudy ? " case-study-page" : ""}">
<a class="skip-link" href="#content">${escape(t("skip"))}</a>
<header class="site-header"><div class="header-row"><a class="brand" href="${h.route("/")}" aria-label="${escape(t("brandAria"))}"><img src="${h.local("assets/icons/favicon-96.png")}" width="28" height="28" alt="">MaxLananas</a><nav class="document-nav" aria-label="${escape(t("navAria"))}">${h.link("/projects/", t("navProjects"))}${h.link("/buildtheearth/", t("navBte"))}${h.link("/development/", t("navDev"))}${h.link("/builds/", t("navGallery"))}${h.link("/about/", t("navAbout"))}${h.link("/#contact", t("navContact"))}</nav>${languageNav(page, h)}</div></header>
<main class="content-page" id="content"><nav class="breadcrumbs" aria-label="${escape(t("breadcrumbAria"))}"><ol>${crumbs.map((crumb, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${escape(crumb.name)}</span>` : h.link(crumb.route, crumb.name)}</li>`).join("")}</ol></nav><article><h1>${escape(page.heading)}</h1>${body}</article></main>
<footer class="site-footer"><p class="footer-brand">${brandIcon("pineapple")}MaxLananas</p><nav class="footer-links" aria-label="${escape(t("footerAria"))}">${h.link("/", t("footerPortfolio"))}${h.link("/projects/", t("navProjects"))}${h.link("/builds/", t("footerShots"))}${h.link("/search/", t("footerSearch"))}${h.link("/about/", t("footerAbout"))}</nav><p class="footer-social-links">${h.link(SITE.github, "GitHub")} · ${h.link(SITE.modrinth, "Modrinth")} · ${h.link(SITE.instagram, "Instagram")} · ${h.link(SITE.discord, "Discord")}</p><p class="footer-copy">© 2026 MaxLananas. ${escape(t("footerCopy"))}</p></footer>
</body></html>
`;
}

function renderHome(template, page, h, head, base) {
  const l = page.lang;
  const blocks = homeBlocks(l);
  const routes = { "/": h.route("/"), "/projects/": h.route("/projects/"), "/about/": h.route("/about/"), "/search/": h.route("/search/"), "/builds/": h.route("/builds/"), "/buildtheearth/": h.route("/buildtheearth/"), "/development/": h.route("/development/") };
  const values = {
    LANG: l, BASE: base, SEO_HEAD: head, LANG_NAV: languageNav(page, h),
    HOME_INTRO: homeIntro(page, h), HOME_PROJECTS: homeProjects(h),
    HOME_PROCESS: blocks.process, HOME_SERVICES: blocks.services, HOME_FAQ: blocks.faq,
    IMAGE_COUNT: String(FILES.length), MODRINTH: SITE.modrinth, GITHUB: SITE.github, DISCORD: SITE.discord, INSTAGRAM: SITE.instagram,
    SORT_ARIA: escape(ui(l, "sortAria", { label: ui(l, "sortFeatured") })),
    RESULTS_COUNT: escape(ui(l, "resultsCount", { shown: FILES.length, total: FILES.length })),
    CATALOG_BROWSE: escape(fill(copy(l, "/", "catalogBrowse"), { total: FILES.length })),
    NOSCRIPT_NOTE: fill(copy(l, "/", "noscript"), { builds: h.link("/builds/", copy(l, "/", "noscriptBuilds")), archive: `<a href="${ARCHIVE_RELEASE}" target="_blank" rel="noopener">${escape(copy(l, "/", "noscriptArchive"))}</a>` })
  };
  const html = template.replace(/\{\{(UI|COPY|ROUTE):([^}]+)\}\}|\{\{(\w+)\}\}/g, (match, namespace, key, plain) => {
    if (namespace === "UI") return escape(ui(l, key));
    if (namespace === "COPY") return escape(copy(l, "/", key));
    if (namespace === "ROUTE") {
      if (!(key in routes)) throw new Error(`Unknown home route token: ${key}`);
      return escape(routes[key]);
    }
    if (!(plain in values)) throw new Error(`Unknown home template token: ${plain}`);
    return values[plain];
  });
  if (/\{\{[A-Z_]/.test(html)) throw new Error(`Unresolved home template token in ${page.path}`);
  return html.replace(/<summary>/g, `<summary>${brandIcon("spark")}`).replace(/(<(?:p|div) class="footer-brand">)/g, `$1${brandIcon("pineapple")}`)
    .replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- Generated by tools/seo-render.mjs. Edit content/ and templates/, not this snapshot. -->");
}

function render404(h, options) {
  const blocks = LANGS.map((language) => {
    const c = (field) => copy(language, "notFound", field);
    const home = pathFor(language, "/");
    return `<section class="err-lang" lang="${language}"><h2 class="err-lang-title">${escape(LANG_LABEL[language])}</h2><p>${escape(c("body"))}</p><a class="err-btn" href="${escape(h.local(home))}">${escape(c("home"))}</a><p class="err-links"><a href="${escape(h.local(pathFor(language, "/projects/")))}">${escape(c("projects"))}</a> · <a href="${escape(h.local(pathFor(language, "/builds/")))}">${escape(c("gallery"))}</a> · <a href="${escape(h.local(home))}#contact">${escape(c("contact"))}</a></p></section>`;
  }).join("\n    ");
  return `<!DOCTYPE html>
<!-- Generated by tools/seo-render.mjs. Edit content/i18n.js, not this snapshot. -->
<html lang="${LANGS[0]}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(copy("en", "notFound", "title"))}</title>
<meta name="robots" content="noindex, follow">
<meta name="description" content="${escape(copy("en", "notFound", "description"))}">
<meta name="theme-color" content="#0a0a0b">
<link rel="icon" href="${h.local("favicon.ico")}" sizes="any">
<link rel="icon" href="${h.local("assets/icons/favicon-96.png")}" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="${h.local("apple-touch-icon.png")}" sizes="180x180">
<link rel="preload" href="${h.local(options.font)}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${h.local(options.notFound || "404.css")}">
</head>
<body>
  <main class="err-wrap">
    <h1>${escape(copy("en", "notFound", "heading"))}</h1>
    ${blocks}
  </main>
  <footer class="err-footer">
    <p class="footer-social-links"><a href="${SITE.github}">GitHub</a> · <a href="${SITE.modrinth}">Modrinth</a> · <a href="${SITE.instagram}">Instagram</a> · <a href="${SITE.discord}">Discord</a></p>
    <p class="err-copy">© 2026 MaxLananas. ${escape(ui("en", "footerCopy"))}</p>
  </footer>
</body>
</html>
`;
}

export async function renderSeo({ manifest = {}, base = "/", ...custom } = {}) {
  base = "/" + base.split("/").filter(Boolean).join("/");
  if (!base.endsWith("/")) base += "/";
  const options = {
    optimized: false, styles: "style.css", notFound: "404.css", font: "assets/fonts/FFFlauta-200.woff2", app: "script.js", pageScript: "page.js",
    preloads: ["gallery-data.js", "image-manifest.js", "image-utils.js", "image-loader.js", "load-queue.js", "image-labels.js", "ui-core.js", "media-i18n.js"], pagePreloads: [],
    googleVerification: SITE.verification.google || process.env.GOOGLE_SITE_VERIFICATION || "", bingVerification: process.env.BING_SITE_VERIFICATION || SITE.verification.bing, ...custom
  };
  options.contentVersion = await contentVersion();
  const pages = sitePages();
  const files = new Map();
  const template = await readFile(resolve(root, "templates/home.html"), "utf8");
  const helperCache = new Map();
  const helperFor = (lang) => {
    if (!helperCache.has(lang)) helperCache.set(lang, helpers(base, manifest, lang));
    return helperCache.get(lang);
  };
  for (const page of pages) {
    const h = helperFor(page.lang);
    const head = headFor(page, pages, h, options);
    files.set(pageFile(page.path), page.home ? renderHome(template, page, h, head, base) : frame(page, pages, pageContent(page, h), h, head));
  }
  const indexable = pages.filter((p) => !p.noindex);
  const hEn = helperFor("en");
  files.set("404.html", render404(hEn, options));
  files.set("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${indexable.map((p) => `  <url><loc>${escape(canonical(p.path))}</loc><lastmod>${p.modified}</lastmod>${languageLinks(p).map(({ lang, path }) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${canonical(path)}"/>`).join("")}</url>`).join("\n")}
</urlset>
`);
  files.set("sitemap-images.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.filter((p) => imageFiles(p).length).map((p) => {
    const h = helperFor(p.lang);
    return `  <url><loc>${escape(canonical(p.path))}</loc>${imageFiles(p).map((item) => `<image:image><image:loc>${escape(canonical(imageSource(item, h)))}</image:loc><image:title>${escape(imageTitle(item, h, p.project?.name))}</image:title><image:caption>${escape(imageCaption(item, h, p.project?.name))}</image:caption></image:image>`).join("")}</url>`;
  }).join("\n")}
</urlset>
`);
  files.set("robots.txt", `User-agent: *
Allow: /
Disallow: /.git/
Disallow: /.github/
Disallow: /node_modules/
Disallow: /tools/
Disallow: /tests/
Disallow: /templates/
Disallow: /content/
Disallow: /docs/
Disallow: /site-pages.json
Disallow: /package.json
Disallow: /package-lock.json
Disallow: /README.md

# Keep CSS, JavaScript, images and search pages crawlable; search carries noindex in HTML.
Sitemap: ${canonical("/sitemap.xml")}
Sitemap: ${canonical("/sitemap-images.xml")}
`);
  files.set("manifest.json", JSON.stringify({ id: base, name: "MaxLananas — Minecraft builds & developer projects", short_name: "MaxLananas", description: SITE.description,
    lang: "en", start_url: base, scope: base, display: "standalone", background_color: "#0a0a0b", theme_color: "#0a0a0b",
    icons: [192, 512].map((size) => ({ src: hEn.local(`assets/icons/icon-${size}.png`), sizes: `${size}x${size}`, type: "image/png", purpose: "any" })) }, null, 2) + "\n");
  files.set("_headers", `# Cloudflare Pages only. GitHub Pages ignores this file.
# Never index a pages.dev mirror or branch preview of the canonical site.
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/gallery/*
  Cache-Control: public, max-age=31536000, immutable

/assets/projects/*
  Cache-Control: public, max-age=31536000, immutable

/assets/video/*
  Cache-Control: public, max-age=31536000, immutable

/search/*
  X-Robots-Tag: noindex, follow

/fr/search/*
  X-Robots-Tag: noindex, follow

/es/search/*
  X-Robots-Tag: noindex, follow

/404.html
  X-Robots-Tag: noindex, follow
`);
  files.set("_redirects", `# Cloudflare Pages path normalization only; not SPA fallback or host redirects.
${pages.map((page) => `${page.path}index.html ${page.path} 301`).join("\n")}
${pages.filter((page) => page.path !== "/").map((page) => `${page.path.slice(0, -1)} ${page.path} 301`).join("\n")}
`);
  files.set("site-pages.json", JSON.stringify({ pages: pages.map(({ path, lang, noindex }) => ({ path, lang, indexable: !noindex })), files: [...files.keys(), "site-pages.json"] }, null, 2) + "\n");
  return { files, pages };
}

export function serviceWorkerRoutes(source, pages = sitePages()) {
  return source.replace(/\/\* pages:start \*\/[\s\S]*?\/\* pages:end \*\//,
    "/* pages:start */ " + JSON.stringify(pages.map((page) => page.path.replace(/^\//, ""))) + " /* pages:end */");
}

export async function writeSeo({ outDir = root, ...options } = {}) {
  const result = await renderSeo(options);
  for (const [file, html] of result.files) {
    const destination = resolve(outDir, file);
    if (!destination.startsWith(resolve(outDir) + "/")) throw new Error("Unsafe generated path");
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  if (resolve(outDir) === root) {
    const worker = await readFile(resolve(root, "sw.js"), "utf8");
    await writeFile(resolve(root, "sw.js"), serviceWorkerRoutes(worker, result.pages));
  }
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { pages } = await writeSeo();
  console.log(`Rendered ${pages.length} static pages, page/image sitemaps and publication metadata.`);
}
