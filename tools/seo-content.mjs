import { SITE, PAGE_SIZE, galleryPath } from "../content/site.js";
import { PROJECTS, FEATURED_PROJECT_SLUGS } from "../content/projects.js";
import { iprofCaseStudy } from "./iprof-case-study.mjs";
import { dateLabel } from "../content/dates.js";
import { projectCard, iprofSpotlight, projectScreenshots, projectVideo, mediaData, projectPicture } from "./project-content.mjs";
import { FILES, CREDITS } from "../gallery-data.js";
import { proxyUrl, originalUrl } from "../image-utils.js";
import { ui, fill } from "../ui.js";
import { copy, label, pathFor, enPath } from "../content/i18n.js";

export const escape = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const bySlug = (slug) => {
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) throw new Error(`Unknown project slug: ${slug}`);
  return project;
};

export function helpers(base = "/", manifest = {}, lang = "en") {
  const local = (path) => base + path.replace(/^\//, "");
  const route = (path) => local(pathFor(lang, path));
  const link = (path, text, attributes = "") => `<a href="${escape(/^https?:/.test(path) ? path : route(path))}"${attributes ? " " + attributes : ""}>${escape(text)}</a>`;
  const t = (key, values) => ui(lang, key, values);
  const c = (key, field) => copy(lang, key, field);
  const imageData = (item) => {
    const meta = manifest[item.name];
    if (!meta) return { src: proxyUrl(item, 640), width: 640, height: 480 };
    const widths = meta.widths.filter((w) => w <= 960);
    if (!widths.length) widths.push(meta.widths[0]);
    const width = widths.find((w) => w >= 640) || widths[widths.length - 1];
    return { src: local(`${meta.base}-${width}.webp`), width: meta.width, height: meta.height,
      avif: widths.map((w) => `${local(`${meta.base}-${w}.avif`)} ${w}w`).join(", "),
      webp: widths.map((w) => `${local(`${meta.base}-${w}.webp`)} ${w}w`).join(", ") };
  };
  const photos = (items, eager = true) => `<div class="photo-grid">${items.map((item, position) => {
    const index = FILES.findIndex((file) => file.name === item.name);
    const image = imageData(item);
    const credit = CREDITS[item.credit];
    const creditCopy = item.credit ? copy(lang, "credits", item.credit) : null;
    const text = label(lang, item, index);
    const project = PROJECTS.find((p) => p.kind === "build" && p.images?.includes(item.name));
    return `<figure class="photo-card" id="image-${index + 1}"><a class="photo-media" href="${escape(originalUrl(item))}" target="_blank" rel="noopener" aria-label="${escape(t("openOriginal", { label: text }))}"><picture>${image.avif ? `<source type="image/avif" srcset="${escape(image.avif)}" sizes="(max-width: 640px) 92vw, (max-width: 1000px) 44vw, 30vw">` : ""}<img src="${escape(image.src)}" ${image.webp ? `srcset="${escape(image.webp)}" sizes="(max-width: 640px) 92vw, (max-width: 1000px) 44vw, 30vw" ` : ""}width="${image.width}" height="${image.height}" alt="${escape(`${text} — MaxLananas (#${String(index + 1).padStart(3, "0")})`)}" loading="${position === 0 && eager ? "eager" : "lazy"}" fetchpriority="${position === 0 && eager ? "high" : "low"}" decoding="async" data-original="${escape(originalUrl(item))}"></picture></a><figcaption><strong>${escape(text)}</strong><p>${creditCopy ? escape(creditCopy.text) + " " + (credit.linkUrl ? link(credit.linkUrl, creditCopy.linkText) : escape(creditCopy.linkText)) : escape(c("/builds/", "captionDefault"))}</p>${project ? `<p>${link(`/projects/${project.slug}/`, t("viewCollection", { name: project.name }))}</p>` : ""}<small>${escape(fill(c("/builds/", "imageMeta"), { index: index + 1, file: item.name }))}</small></figcaption></figure>`;
  }).join("")}</div>`;
  const api = { lang, local, route, manifest, link, cards: (projects) => `<div class="project-grid">${projects.map((p) => projectCard(p, api)).join("")}</div>`,
    photos, imageData, mediaData: (key) => mediaData(key, local), t, c };
  return api;
}

export function homeIntro(page, h) {
  const l = h.lang;
  if (page.noindex) {
    const k = "/search/";
    return `<h1>${escape(page.heading)}</h1><p>${fill(copy(l, k, "intro"), { projects: h.link("/projects/", copy(l, k, "introProjects")), builds: h.link("/builds/", copy(l, k, "introBuilds")) })}</p>`;
  }
  const k = "/";
  return `<h1>${escape(page.heading)}</h1><p class="identity-line">${escape(copy(l, k, "identity"))}</p><p>${fill(copy(l, k, "intro"), {
    iprof: h.link("/projects/iprof-redesign/", copy(l, k, "introIprof")), bte: h.link("/buildtheearth/", copy(l, k, "introBte")),
    dev: h.link("/development/", copy(l, k, "introDev")), about: h.link("/about/", copy(l, k, "introAbout")) })}</p>`;
}

export function homeProjects(h) {
  const l = h.lang, k = "/";
  const selected = FEATURED_PROJECT_SLUGS.filter((slug) => slug !== "iprof-redesign").map(bySlug);
  return `<section class="site-section" aria-labelledby="projectsHeading"><p class="eyebrow">${escape(copy(l, k, "projectsEyebrow"))}</p><h2 id="projectsHeading">${escape(copy(l, k, "projectsHeading"))}</h2><p>${escape(copy(l, k, "projectsIntro"))}</p>${iprofSpotlight(bySlug("iprof-redesign"), h)}${h.cards(selected)}<p class="section-links">${fill(copy(l, k, "sectionLinks"), { dev: h.link("/development/", copy(l, k, "sectionLinksDev")), modrinth: h.link(SITE.modrinth, copy(l, k, "sectionLinksModrinth")) })}</p></section>`;
}

export function homeBlocks(l = "en") {
  const k = "/";
  return {
    process: copy(l, k, "process").map((step, index) => `<li><span class="num">${String(index + 1).padStart(2, "0")}</span><h3>${escape(step.title)}</h3><p>${escape(step.text)}</p></li>`).join(""),
    services: copy(l, k, "services").map((service, index) => `<li>${SERVICE_ICONS[index] || ""}<strong>${escape(service.title)}</strong><span>${escape(service.text)}</span></li>`).join(""),
    faq: copy(l, k, "faq").map((item) => `<details><summary>${escape(item.q)}</summary><p>${escape(item.a)}</p></details>`).join("")
  };
}
const SERVICE_ICONS = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21V9l8-6 8 6v12"/><path d="M9 21v-6h6v6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12Z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/></svg>'
];

function projectPage(page, h) {
  const l = h.lang, p = page.project, { link, cards, t } = h;
  const sourceUrl = p.source?.url || (p.repo && p.revision ? p.repo + "/blob/" + p.revision + "/" + p.evidenceFile : p.repo);
  const sourceLabel = p.modrinth ? t("sourceModrinth") : p.source?.labelKey ? t(p.source.labelKey) : l === "en" ? p.source?.label || t("sourceRepo") : t("sourceRepo");
  const primary = p.modrinth ? link(p.modrinth, t("launchModrinth"), 'class="btn-pill-solid"')
    : p.web && p.launch?.url ? link(p.launch.url, t("launchApp"), 'class="btn-pill-solid"')
    : p.repo ? link(p.repo, t("launchGithub"), 'class="btn-pill-solid"')
    : p.source ? link(p.source.url, t("launchSource"), 'class="text-link"') : link("/#contact", t("launchContact"), 'class="btn-pill-solid"');
  const provenance = sourceUrl ? `<section class="source-note"><h2>${t("projectSources")}</h2><p>${link(sourceUrl, sourceLabel)} · ${fill(t("reviewedOn"), { date: `<time datetime="${page.reviewed}">${dateLabel(page.reviewed, l)}</time>` })}. ${p.modrinth ? t("modrinthPrimary") : t("followSource")}</p>${p.modrinth ? `<p>${link(p.modrinth + "/versions", t("versionsDownloads"))}${p.repo ? " · " + link(p.repo, t("publicRepo")) : ""}</p>` : ""}${p.artwork ? `<p>${escape(t("artworkRole"))}: ${link(p.artwork.url, p.artwork.name)}.</p>` : ""}</section>` : "";
  const related = `<section><h2>${t("sectionRelated")}</h2>${cards(p.related.map(bySlug))}<p class="section-links">${link("/projects/", t("relatedAll"))} · ${link(p.bte ? "/buildtheearth/" : "/development/", p.bte ? t("relatedBte") : t("relatedDev"))}</p></section>`;
  const intro = `<p class="eyebrow">${escape(p.categoryFor(l))}</p>${p.introFor(l).map((text) => `<p>${escape(text)}</p>`).join("")}<div class="project-actions">${primary}</div>`;
  const features = p.featuresFor(l).map((text) => `<li>${escape(text)}</li>`).join("");
  const faq = p.hasFor(l, "faq") ? `<section><h2>${escape(t("sectionFaq"))}</h2><div class="faq project-faq">${p.faqFor(l).map((item) => `<details><summary>${escape(item.q)}</summary><p>${escape(item.a)}</p></details>`).join("")}</div></section>` : "";
  const requirements = l === "en" ? p.requirements : p.requirements ? p.requirementsFor(l) : "";
  if (p.kind === "design") {
    return `<figure class="project-single-image project-lead-image">${projectPicture(p.leadMedia || p.cover, h, { alt: ui(l, "cardAlt", { name: p.name }), eager: true, sizes: "(max-width: 1100px) 92vw, 1050px" })}</figure>${intro}<p class="project-scope-notice">${t("scopeNotice")}</p>${projectVideo(p, h)}${projectScreenshots(p, h)}<section><h2>${t("sectionDesignFocus")}</h2><ul>${features}</ul></section><section><h2>${t("sectionDesignScope")}</h2><p>${escape(p.limitsFor(l))}</p></section>${provenance}${related}`;
  }
  const shots = p.images ? `<section><h2>${p.kind === "build" ? t("sectionShots") : t("sectionExampleBuilds")}</h2>${p.hasFor(l, "imagesNote") ? `<p>${escape(p.imagesNoteFor(l))}</p>` : ""}${h.photos(p.images.map((name) => FILES.find((file) => file.name === name)))}</section>` : "";
  const upstream = p.upstream ? `<p>${fill(t("upstreamNote"), { upstream: link(p.upstream, "TehBrian’s BuildersUtilities"), original: link("https://www.spigotmc.org/resources/builders-utilities.42361/", "Arcaniax’s Builder’s Utilities"), license: link(p.repo + "/blob/" + p.revision + "/LICENSE", t("upstreamLicense")) })}</p>` : "";
  return `${intro}${projectScreenshots(p, h)}
      <section><h2>${p.kind === "build" ? t("sectionExplore") : t("sectionDoes")}</h2><ul>${features}</ul></section>
      ${faq}
      ${requirements ? `<section><h2>${t("sectionEnv")}</h2><p>${escape(requirements)}</p></section>` : ""}
      <section><h2>${p.kind === "build" ? t("sectionUsing") : t("sectionStart")}</h2><p>${escape(p.usageFor(l))}</p></section>
      ${shots}
      <section><h2>${t("sectionScope")}</h2><p>${escape(p.limitsFor(l))}</p>${upstream}</section>
      ${provenance}${related}`;
}

function aboutPage(h) {
  const l = h.lang, k = "/about/", c = (field) => copy(l, k, field), { link } = h;
  const profiles = [{ url: SITE.github, attributes: 'rel="me"' }, { url: SITE.modrinth, attributes: 'rel="me"' }, { url: SITE.instagram, attributes: 'rel="me"' }, { url: SITE.discord, attributes: "" }];
  return `<p class="eyebrow">${escape(c("eyebrow"))}</p><p>${escape(c("p1"))}</p><p>${fill(c("p2"), { strong: "<strong>MaxLananas</strong>" })}</p>
      <section><h2>${escape(c("s1Title"))}</h2><p>${fill(c("s1"), { builds: link("/builds/", c("s1Builds")), bte: link("/buildtheearth/", c("s1Bte")) })}</p></section>
      <section><h2>${escape(c("s2Title"))}</h2><p>${fill(c("s2a"), { iprof: link("/projects/iprof-redesign/", c("s2aIprof")), modrinth: link(SITE.modrinth, c("s2aModrinth")) })}</p><p>${fill(c("s2b"), { homegui: link("/projects/homegui/", "HomeGUI"), tracebte: link("/projects/tracebte/", "TraceBTE"), railway: link("/projects/railway-tools-axiom/", "Railway Tools"), pineapple: link("/projects/pineappleui/", "PineappleUI") })}</p><p>${fill(c("s2c"), { projects: link("/projects/", c("s2cProjects")) })}</p></section>
      <section><h2>${escape(c("s3Title"))}</h2><ul>${c("s3Items").map((item, index) => `<li>${link(profiles[index].url, item.label, profiles[index].attributes)} : ${escape(item.text)}</li>`).join("")}</ul><p>${fill(c("s3Note"), { process: link("/#process", c("s3NoteProcess")), contact: link("/#contact", c("s3NoteContact")) })}</p></section>
      <section><h2>${escape(c("s4Title"))}</h2><p>${escape(c("s4"))}</p></section>`;
}

function projectsHub(h) {
  const l = h.lang, k = "/projects/", c = (field) => copy(l, k, field);
  const group = (collections) => PROJECTS.filter((p) => collections.includes(p.collection));
  return `<p>${escape(c("intro"))}</p>${iprofSpotlight(bySlug("iprof-redesign"), h, { eager: true })}<section><h2>${escape(c("modrinthTitle"))}</h2>${h.cards(group(["release"]))}<p>${h.link(SITE.modrinth, c("modrinthCta"))}</p></section><section><h2>${escape(c("labTitle"))}</h2><p>${escape(c("labIntro"))}</p>${h.cards(group(["lab"]))}</section><section><h2>${escape(c("refsTitle"))}</h2><p>${escape(c("refsIntro"))}</p>${h.cards(group(["reference", "build"]))}</section>`;
}

function bteHub(h) {
  const l = h.lang, k = "/buildtheearth/", c = (field) => copy(l, k, field);
  return `<p>${escape(c("p1"))}</p><p>${fill(c("p2"), { strong: `<strong>${escape(c("p2Strong"))}</strong>`, bte: h.link(SITE.bte, c("p2Bte")) })}</p><section><h2>${escape(c("s1Title"))}</h2><p>${escape(c("s1"))}</p><ul>${c("s1Items").map((item) => `<li>${h.link(`/projects/${item.slug}/`, item.label)} ${escape(item.after)}</li>`).join("")}</ul></section><section><h2>${escape(c("s2Title"))}</h2>${h.cards(PROJECTS.filter((p) => p.bte))}</section><section><h2>${escape(c("s3Title"))}</h2><p>${fill(c("s3"), { builds: h.link("/builds/", c("s3Builds")), bu: h.link("/projects/builders-utilities-bt-corsica/", c("s3Bu")) })}</p><p>${fill(c("s3Links"), { about: h.link("/about/", c("s3LinksAbout")), guide: h.link("/guides/minecraft-mods-plugins-addons/", c("s3LinksGuide")) })}</p></section>`;
}

function developmentHub(h) {
  const l = h.lang, k = "/development/", c = (field) => copy(l, k, field);
  const group = (collection) => PROJECTS.filter((p) => p.collection === collection);
  return `<p>${fill(c("intro"), { about: h.link("/about/", c("introAbout")) })}</p><nav class="dev-section-nav" aria-label="${escape(c("navAria"))}"><a href="#interface-work">${escape(c("navInterface"))}</a><a href="#minecraft-releases">${escape(c("navReleases"))}</a><a href="#software-lab">${escape(c("navLab"))}</a></nav><section id="interface-work" class="dev-featured-section"><h2 class="section-label">${escape(c("interfaceLabel"))}</h2>${iprofSpotlight(bySlug("iprof-redesign"), h, { eager: true })}</section><section id="minecraft-releases"><p class="eyebrow">${escape(c("releasesEyebrow"))}</p><h2>${escape(c("releasesTitle"))}</h2><p>${escape(c("releases"))}</p>${h.cards(group("release"))}<p class="section-links">${fill(c("releasesLinks"), { modrinth: h.link(SITE.modrinth, c("releasesLinksModrinth")), guide: h.link("/guides/minecraft-mods-plugins-addons/", c("releasesLinksGuide")) })}</p></section><section id="software-lab"><p class="eyebrow">${escape(c("labEyebrow"))}</p><h2>${escape(c("labTitle"))}</h2><p>${escape(c("lab"))}</p>${h.cards(group("lab"))}<p class="section-links">${fill(c("labLinks"), { github: h.link(SITE.github + "?tab=repositories", c("labLinksGithub")) })}</p></section><section><h2>${escape(c("refsTitle"))}</h2><p>${fill(c("refs"), { bte: h.link("/buildtheearth/", c("refsBte")) })}</p></section>`;
}

function guideArticle(page, h) {
  const l = h.lang, k = "/guides/minecraft-mods-plugins-addons/", c = (field) => copy(l, k, field), { link, t } = h;
  const byline = `<p class="byline">${fill(t("byline"), { author: link("/about/", "MaxLananas"), date: `<time datetime="${page.published}">${dateLabel(page.published, l)}</time>` })}${page.modified !== page.published ? ` · ${fill(t("updated"), { date: `<time datetime="${page.modified}">${dateLabel(page.modified, l)}</time>` })}` : ""}</p>`;
  const table = `<section><h2>${escape(c("compareTitle"))}</h2><div class="table-scroll" role="region" aria-label="${escape(c("tableAria"))}" tabindex="0"><table><caption>${escape(c("tableCaption"))}</caption><thead><tr><th scope="col">${escape(c("thProject"))}</th><th scope="col">${escape(c("thRuns"))}</th><th scope="col">${escape(c("thBoundary"))}</th></tr></thead><tbody>${c("rows").map((row) => `<tr><th scope="row">${link(`/projects/${row.slug}/`, row.label)}</th><td>${escape(row.runs)}</td><td>${escape(row.boundary)}</td></tr>`).join("")}</tbody></table></div></section>`;
  const closing = c("sections")[c("sections").length - 1];
  const chapters = c("sections").slice(0, -1).map((section) => `<section><h2>${escape(section.title)}</h2>${section.body.map((text) => `<p>${fill(escape(text), { code: "<code>/homes</code>" })}</p>`).join("")}</section>`).join("");
  const steps = `<section><h2>${escape(closing.title)}</h2><ol>${closing.steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol><p>${fill(closing.closing, { dev: link("/development/", closing.closingDev) })}</p></section>`;
  return `${byline}<p>${escape(c("intro"))}</p>
    ${table}
    ${chapters}
    ${steps}`;
}

function galleryPage(page, h) {
  const l = h.lang, k = "/builds/", c = (field) => copy(l, k, field), { link, t } = h;
  const first = (page.galleryPage - 1) * PAGE_SIZE;
  const items = FILES.slice(first, first + PAGE_SIZE);
  const total = Math.ceil(FILES.length / PAGE_SIZE);
  const pages = Array.from({ length: total }, (_, i) => i + 1).map((n) => link(galleryPath(n), fill(t("pageShort"), { page: n }), n === page.galleryPage ? 'aria-current="page"' : `aria-label="${escape(fill(t("pageOf"), { page: n, total }))}"`)).join("");
  const pagination = `<nav class="pagination" aria-label="${escape(t("pageNavAria"))}">${page.galleryPage > 1 ? link(galleryPath(page.galleryPage - 1), t("prevLink"), `rel="prev" aria-label="${escape(t("prevPage"))}"`) : ""}${pages}${page.galleryPage < total ? link(galleryPath(page.galleryPage + 1), t("nextLink"), `rel="next" aria-label="${escape(t("nextPage"))}"`) : ""}</nav>`;
  return `<p>${escape(fill(c("intro1"), { first: first + 1, last: first + items.length, total: FILES.length }))}</p><p>${fill(c("intro2"), { gallery: link("/#work", c("intro2Gallery")), lemans: link("/projects/le-mans/", c("intro2Lemans")), bte: link("/buildtheearth/", c("intro2Bte")) })}</p>${pagination}${h.photos(items)}${pagination}<section><h2>${escape(c("creditsTitle"))}</h2><p>${escape(c("credits1"))}</p><p>${fill(c("credits2"), { about: link("/about/", c("credits2About")) })}</p></section>`;
}

export function pageContent(page, h) {
  const en = page.enPath || enPath(page.path);
  if (page.caseStudy) return iprofCaseStudy(page, h);
  if (page.project) return projectPage(page, h);
  if (page.type === "ProfilePage") return aboutPage(h);
  if (en === "/projects/") return projectsHub(h);
  if (en === "/buildtheearth/") return bteHub(h);
  if (en === "/development/") return developmentHub(h);
  if (page.type === "Article") return guideArticle(page, h);
  if (page.galleryPage) return galleryPage(page, h);
  throw new Error(`No content renderer for ${page.path}`);
}
