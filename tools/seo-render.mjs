import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { SITE, PAGE_SIZE, canonical, galleryPath, projectPath } from "../content/site.js";
import { sitePages } from "../content/pages.js";
import { PROJECTS, developmentProjects } from "../content/projects.js";
import { projectMedia } from "./project-content.mjs";
import { FILES, CREDITS } from "../gallery-data.js";
import { imageLabel } from "../image-labels.js";
import { escape, helpers, pageContent, homeIntro, homeProjects } from "./seo-content.mjs";

const root = resolve(import.meta.dirname, "..");
export const pageFile = (path) => path === "/" ? "index.html" : path.replace(/^\//, "") + "index.html";
const PERSON = canonical("/#person");
const WEBSITE = canonical("/#website");
const imageFiles = (page) => page.galleryPage
  ? FILES.slice((page.galleryPage - 1) * PAGE_SIZE, page.galleryPage * PAGE_SIZE)
  : [...(page.project?.images || []).map((name) => FILES.find((item) => item.name === name)), ...(page.project?.media || []).map((item) => ({ ...item, projectMedia: true }))];
const imageSource = (item, h) => item.projectMedia ? h.mediaData(item.key).src : h.imageData(item).src;
const socialImage = (page) => projectMedia[page.project?.social || page.project?.cover]?.social || "assets/social/portfolio.png";

export const pageImages = imageFiles;

function breadcrumbs(page, pages) {
  if (page.home) return [];
  const entries = [{ name: page.lang === "fr" ? "Accueil" : "Home", url: canonical("/") }];
  if (page.parent) {
    const parent = pages.find((p) => p.path === page.parent);
    if (!parent) throw new Error(`Missing parent ${page.parent}`);
    entries.push({ name: parent.heading, url: canonical(parent.path) });
  }
  entries.push({ name: page.heading, url: canonical(page.path) });
  return entries;
}
export function schemaFor(page, pages, h) {
  const url = canonical(page.path);
  const person = {
    "@type": "Person", "@id": PERSON, name: SITE.name, url: SITE.url,
    description: "Minecraft builder and developer of client mods, server plugins, building tools and software interfaces.",
    image: canonical("/apple-touch-icon.png"),
    mainEntityOfPage: { "@id": canonical("/about/#webpage") },
    sameAs: [SITE.github, SITE.instagram, SITE.modrinth], alternateName: "maxlananass",
    knowsAbout: ["Minecraft building", "BuildTheEarth", "Java development", "Web development", "Software interfaces", "Interface design"],
    contactPoint: { "@type": "ContactPoint", contactType: "Project inquiries", url: SITE.discord }
  };
  const graph = [person, { "@type": "WebSite", "@id": WEBSITE, url: SITE.url, name: SITE.name, alternateName: "MaxLananas Portfolio", inLanguage: ["en", "fr"], publisher: { "@id": PERSON } }];
  const webPage = {
    "@type": page.type === "Article" ? "WebPage" : page.type,
    "@id": url + "#webpage", url, name: page.title, description: page.description,
    inLanguage: page.lang, isPartOf: { "@id": WEBSITE }, about: { "@id": PERSON }
  };
  const bte = page.path === "/buildtheearth/" || page.project?.bte;
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
  if (page.type === "Article") {
    const article = { "@type": "Article", "@id": url + "#article", headline: page.heading, description: page.description,
      datePublished: page.updated, dateModified: page.updated, author: { "@id": PERSON }, publisher: { "@id": PERSON },
      mainEntityOfPage: { "@id": webPage["@id"] }, inLanguage: page.lang, image: canonical("/assets/social/portfolio.png"),
      citation: PROJECTS.filter((p) => p.kind === "software").map((p) => p.source?.url || p.repo).filter(Boolean) };
    graph.push(article);
    webPage.mainEntity = { "@id": article["@id"] };
  }
  if (page.project) {
    const p = page.project;
    const work = { "@id": url + "#project", "@type": p.kind === "software" && p.repo ? "SoftwareSourceCode" : "CreativeWork",
      name: p.name, url, description: p.summary,
      ...(p.upstream || p.kind === "build" ? { contributor: { "@id": PERSON } } : { creator: { "@id": PERSON } }) };
    if (p.repo) {
      work.codeRepository = p.repo;
      if (p.kind !== "software") delete work.codeRepository;
      if (p.revision && p.evidenceFile) work.citation = p.repo + "/blob/" + p.revision + "/" + p.evidenceFile;
    }
    if (p.source?.url) work.citation = p.source.url;
    if (p.kind === "design") work.genre = "Independent interface redesign";
    if (p.bte) work.about = { "@id": canonical("/buildtheearth/#initiative") };
    if (p.kind === "software" && p.repo) work.programmingLanguage = p.modrinth ? "Java" : p.language;
    if (p.upstream) { work.isBasedOn = p.upstream; work.creditText = "BT Corsica adaptation by MaxLananas; upstream BuildersUtilities by TehBrian and Arcaniax."; }
    if (p.kind === "build") work.creditText = "Made within BuildTheEarth France; portfolio contribution by MaxLananas.";
    if (p.kind === "documentation") { work.inLanguage = "fr"; work.genre = "Unofficial community documentation"; }
    if (p.application) {
      const application = { "@type": p.web ? "WebApplication" : "SoftwareApplication", "@id": url + "#application", name: p.name,
        url: p.launch?.url || url, description: p.summary, applicationCategory: p.application, softwareRequirements: p.requirements,
        ...(p.upstream ? { contributor: { "@id": PERSON } } : { author: { "@id": PERSON } }) };
      if (p.media?.length) application.screenshot = p.media.map((item) => canonical(h.mediaData(item.key).src));
      graph.push(application);
      work.targetProduct = { "@id": application["@id"] };
    }
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
      graph.push({ "@type": "ImageObject", "@id": id, contentUrl: canonical(imageSource(item, h)),
        name: item.projectMedia ? item.title : imageLabel(item, index), caption: item.projectMedia ? item.alt : imageLabel(item, index),
        creditText: item.projectMedia ? "Project presentation supplied by MaxLananas" : credit ? `${credit.text} ${credit.linkText}` : "From MaxLananas’s personal build portfolio",
        isPartOf: { "@id": webPage["@id"] } });
      references.push({ "@id": id });
    }
    webPage.hasPart = references;
  }
  if (page.project?.video) {
    const video = page.project.video;
    const id = url + "#video";
    graph.push({ "@type": "VideoObject", "@id": id, name: video.name, description: video.description,
      embedUrl: `https://drive.google.com/file/d/${video.driveId}/preview`, thumbnailUrl: canonical(h.mediaData(video.poster).src),
      creator: { "@id": PERSON }, isPartOf: { "@id": webPage["@id"] } });
    webPage.hasPart = [...(webPage.hasPart || []), { "@id": id }];
  }

  const selected = page.path === "/projects/" ? PROJECTS : page.path === "/development/" ? developmentProjects() : page.path === "/buildtheearth/" ? PROJECTS.filter((p) => p.bte) : [];
  if (selected.length) {
    graph.push({ "@type": "ItemList", "@id": url + "#projects", name: page.heading,
      itemListElement: selected.map((p, index) => ({ "@type": "ListItem", position: index + 1, name: p.name, url: canonical(projectPath(p.slug)) })) });
    webPage.mainEntity = { "@id": url + "#projects" };
  }
  graph.push(webPage);
  return { "@context": "https://schema.org", "@graph": graph };
}

function headFor(page, pages, h, options) {
  const url = canonical(page.path);
  const meta = (key, value, property = false) => `<meta ${property ? "property" : "name"}="${key}" content="${escape(value)}">`;
  const social = socialImage(page);
  const socialAlt = page.project ? `${page.project.name} — project presentation by MaxLananas` : "MaxLananas — Minecraft builds and developer projects";
  const graph = JSON.stringify(schemaFor(page, pages, h)).replace(/</g, "\\u003c");
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(page.title)}</title>
${meta("description", page.description)}
${meta("robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")}
${page.noindex ? "" : `<link rel="canonical" href="${url}">`}
${meta("author", SITE.name)}
${meta("theme-color", "#0a0a0b")}
${meta("color-scheme", "dark")}
${meta("og:type", page.type === "Article" ? "article" : "website", true)}
${meta("og:url", url, true)}
${meta("og:site_name", SITE.name, true)}
${meta("og:title", page.title, true)}
${meta("og:description", page.description, true)}
${meta("og:locale", page.lang === "fr" ? "fr_FR" : "en_US", true)}
${meta("og:image", canonical(social), true)}
${meta("og:image:type", social.endsWith(".jpg") ? "image/jpeg" : "image/png", true)}
${meta("og:image:width", "1200", true)}
${meta("og:image:height", "630", true)}
${meta("og:image:alt", socialAlt, true)}
${meta("twitter:card", "summary_large_image")}
${meta("twitter:title", page.title)}
${meta("twitter:description", page.description)}
${meta("twitter:image", canonical(social))}
${meta("twitter:image:alt", socialAlt)}
${page.type === "Article" ? meta("article:published_time", page.updated, true) + "\n" + meta("article:modified_time", page.updated, true) + "\n" + meta("article:author", canonical("/about/"), true) : ""}
${page.alternates ? `<link rel="alternate" hreflang="en" href="${canonical("/about/")}"><link rel="alternate" hreflang="fr" href="${canonical("/fr/a-propos/")}"><link rel="alternate" hreflang="x-default" href="${canonical("/about/")}">` : ""}
${options.googleVerification ? meta("google-site-verification", options.googleVerification) : ""}
${options.bingVerification ? meta("msvalidate.01", options.bingVerification) : ""}
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
  const fr = page.lang === "fr";
  if (page.project || page.type === "Article") {
    const headings = [];
    body = body.replace(/<h2>([^<]+)<\/h2>/g, (_, title) => {
      const id = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, title });
      return `<h2 id="${id}">${title}</h2>`;
    });
    body = `<details class="contents"><summary>On this page</summary><nav aria-label="On this page"><ul>${headings.map(({id, title}) => `<li><a href="#${id}">${title}</a></li>`).join("")}</ul></nav></details>` + body;
  }
  const crumbs = breadcrumbs(page, pages);
  return `<!DOCTYPE html>
<!-- Generated by tools/seo-render.mjs. Edit content/ and templates/, not this snapshot. -->
<html lang="${page.lang}" data-base="${h.local("")}"><head>${head}</head><body class="document-page">
<a class="skip-link" href="#content">${fr ? "Aller au contenu" : "Skip to content"}</a>
<header class="site-header"><div class="header-row"><a class="brand" href="${h.local("")}" aria-label="MaxLananas home"><img src="${h.local("assets/icons/favicon-96.png")}" width="28" height="28" alt="">MaxLananas</a><nav class="document-nav" aria-label="${fr ? "Navigation principale" : "Primary"}">${h.link("/projects/", fr ? "Projets" : "Projects")}${h.link("/buildtheearth/", "BuildTheEarth")}${h.link("/development/", fr ? "Développement" : "Development")}${h.link("/builds/", fr ? "Galerie" : "Gallery")}${h.link("/about/", fr ? "Profil (EN)" : "About")}${h.link("/#contact", "Contact")}</nav></div></header>
<main class="content-page" id="content"><nav class="breadcrumbs" aria-label="${fr ? "Fil d’Ariane" : "Breadcrumb"}"><ol>${crumbs.map((crumb, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${escape(crumb.name)}</span>` : h.link(new URL(crumb.url).pathname, crumb.name)}</li>`).join("")}</ol></nav><article><h1>${escape(page.heading)}</h1>${body}</article></main>
<footer class="site-footer"><p class="footer-brand">MaxLananas</p><nav class="footer-links" aria-label="Footer">${h.link("/", fr ? "Accueil" : "Portfolio")}${h.link("/projects/", fr ? "Projets" : "Projects")}${h.link("/builds/", fr ? "Toutes les images" : "All screenshots")}${h.link("/search/", fr ? "Recherche (EN)" : "Search")}${h.link("/about/", "About MaxLananas")}${h.link("/fr/a-propos/", "Profil en français", 'lang="fr"')}</nav><p class="footer-social-links">${h.link(SITE.github, "GitHub") } · ${h.link(SITE.modrinth, "Modrinth")} · ${h.link(SITE.instagram, "Instagram")} · ${h.link(SITE.discord, "Discord")}</p><p class="footer-copy">© 2026 MaxLananas. ${fr ? "Portfolio personnel indépendant. Les créations restent la propriété de leurs auteurs respectifs." : "Independent personal portfolio. All creations remain the property of their respective owners."}</p></footer>
</body></html>\n`;
}

export async function renderSeo({ manifest = {}, base = "/", ...custom } = {}) {
  base = "/" + base.split("/").filter(Boolean).join("/");
  if (!base.endsWith("/")) base += "/";
  const options = {
    optimized: false, styles: "style.css", font: "assets/fonts/FFFlauta-200.woff2", app: "script.js", pageScript: "page.js",
    preloads: ["gallery-data.js", "image-manifest.js", "image-utils.js", "image-loader.js", "load-queue.js", "image-labels.js"], pagePreloads: [],
    googleVerification: process.env.GOOGLE_SITE_VERIFICATION || SITE.verification.google, bingVerification: process.env.BING_SITE_VERIFICATION || SITE.verification.bing, ...custom
  };
  const pages = sitePages();
  const files = new Map();
  const h = helpers(base, manifest);
  const template = await readFile(resolve(root, "templates/home.html"), "utf8");
  for (const page of pages) {
    const head = headFor(page, pages, h, options);
    const html = page.home ? template.replace("{{SEO_HEAD}}", head).replace("{{HOME_INTRO}}", homeIntro(page, h))
      .replace("{{HOME_PROJECTS}}", homeProjects(h)).replaceAll("{{MODRINTH}}", SITE.modrinth).replaceAll("{{IMAGE_COUNT}}", String(FILES.length)).replaceAll("{{BASE}}", base)
      : frame(page, pages, pageContent(page, h), h, head);
    files.set(pageFile(page.path), page.home ? html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- Generated by tools/seo-render.mjs. Edit content/ and templates/, not this snapshot. -->") : html);
  }
  const indexable = pages.filter((p) => !p.noindex);
  files.set("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `  <url><loc>${escape(canonical(p.path))}</loc><lastmod>${p.updated}</lastmod>${p.alternates ? `<xhtml:link xmlns:xhtml="http://www.w3.org/1999/xhtml" rel="alternate" hreflang="en" href="${canonical("/about/")}"/><xhtml:link xmlns:xhtml="http://www.w3.org/1999/xhtml" rel="alternate" hreflang="fr" href="${canonical("/fr/a-propos/")}"/><xhtml:link xmlns:xhtml="http://www.w3.org/1999/xhtml" rel="alternate" hreflang="x-default" href="${canonical("/about/")}"/>` : ""}</url>`).join("\n")}\n</urlset>\n`);
  files.set("sitemap-images.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.filter((p) => imageFiles(p).length).map((p) => `  <url><loc>${escape(canonical(p.path))}</loc>${imageFiles(p).map((item) => `<image:image><image:loc>${escape(canonical(imageSource(item, h)))}</image:loc></image:image>`).join("")}</url>`).join("\n")}\n</urlset>\n`);
  files.set("robots.txt", `User-agent: *\nAllow: /\nDisallow: /.git/\nDisallow: /.github/\nDisallow: /node_modules/\nDisallow: /tools/\nDisallow: /tests/\nDisallow: /templates/\nDisallow: /content/\nDisallow: /docs/\nDisallow: /site-pages.json\nDisallow: /package.json\nDisallow: /package-lock.json\nDisallow: /README.md\n\n# Keep CSS, JavaScript, images and /search/ crawlable; search carries noindex in HTML.\nSitemap: ${canonical("/sitemap.xml")}\nSitemap: ${canonical("/sitemap-images.xml")}\n`);
  files.set("manifest.json", JSON.stringify({ id: base, name: "MaxLananas — Minecraft builds & developer projects", short_name: "MaxLananas", description: SITE.description,
    lang: "en", start_url: base, scope: base, display: "standalone", background_color: "#0a0a0b", theme_color: "#0a0a0b",
    icons: [192, 512].map((size) => ({ src: h.local(`assets/icons/icon-${size}.png`), sizes: `${size}x${size}`, type: "image/png", purpose: "any" })) }, null, 2) + "\n");
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

/search/*
  X-Robots-Tag: noindex, follow

/404.html
  X-Robots-Tag: noindex, follow
`);
  files.set("_redirects", `# Cloudflare Pages path normalization only; not SPA fallback or host redirects.
${pages.map((page) => `${page.path}index.html ${page.path} 301`).join("\n")}
${pages.filter((page) => page.path !== "/").map((page) => `${page.path.slice(0, -1)} ${page.path} 301`).join("\n")}
`);
  files.set("site-pages.json", JSON.stringify({ pages: pages.map(({ path, noindex }) => ({ path, indexable: !noindex })), files: [...files.keys(), "site-pages.json"] }, null, 2) + "\n");
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
