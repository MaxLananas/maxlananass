import { PAGE_SIZE, galleryPath, projectPath } from "./site.js";
import { PROJECTS } from "./projects.js";
import { FILES } from "../gallery-data.js";
import records from "./page-dates.json" with { type: "json" };
import { pageDates } from "./dates.js";
import { LANGS, pathFor } from "./i18n.js";
import { META } from "./projects-i18n.js";
import { fill } from "../ui.js";

function basePages() {
  const pages = [
    { enPath: "/", type: "WebPage", home: true },
    { enPath: "/about/", type: "ProfilePage" },
    { enPath: "/projects/", type: "CollectionPage" },
    { enPath: "/buildtheearth/", type: "CollectionPage" },
    { enPath: "/development/", type: "CollectionPage" },
    { enPath: "/guides/minecraft-mods-plugins-addons/", type: "Article", parent: "/development/" },
    { enPath: "/search/", type: "WebPage", home: true, noindex: true }
  ];
  for (const project of PROJECTS) {
    pages.push({ enPath: projectPath(project.slug), type: "WebPage", project, parent: "/projects/", ...(project.slug === "iprof-redesign" ? { caseStudy: true } : {}) });
  }
  for (let page = 1; page <= Math.ceil(FILES.length / PAGE_SIZE); page++) {
    pages.push({ enPath: galleryPath(page), type: "CollectionPage", galleryPage: page, parent: page > 1 ? "/builds/" : "/projects/" });
  }
  return pages;
}

function metaFor(lang, base) {
  const key = base.galleryPage ? "/builds/" : base.enPath;
  const entry = META[lang]?.[key];
  if (!entry) throw new Error(`Missing ${lang} metadata for ${key}`);
  if (!base.galleryPage) {
    if (!entry.title || !entry.heading || !entry.description) throw new Error(`Incomplete ${lang} metadata for ${key}`);
    return { title: entry.title, heading: entry.heading, description: entry.description };
  }
  const values = { page: base.galleryPage, first: (base.galleryPage - 1) * PAGE_SIZE + 1, last: Math.min(base.galleryPage * PAGE_SIZE, FILES.length), total: FILES.length };
  return base.galleryPage > 1
    ? { title: fill(entry.titlePage, values), heading: fill(entry.headingPage, values), description: fill(entry.description, values) }
    : { title: entry.title, heading: entry.heading, description: fill(entry.description, values) };
}

export function sitePages() {
  const pages = [];
  for (const base of basePages()) {
    const dates = pageDates(base.enPath, records);
    const alternates = LANGS.map((lang) => ({ lang, path: pathFor(lang, base.enPath) }));
    for (const lang of LANGS) {
      pages.push({ ...base, ...dates, ...metaFor(lang, base), lang, alternates,
        path: pathFor(lang, base.enPath), parent: base.parent ? pathFor(lang, base.parent) : undefined });
    }
  }
  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.path)) throw new Error(`Duplicate page path: ${page.path}`);
    seen.add(page.path);
    if (page.title.length > 60) throw new Error(`Title over 60 characters (${page.title.length}) for ${page.path}`);
    if (page.description.length > 160) throw new Error(`Description over 160 characters (${page.description.length}) for ${page.path}`);
  }
  return pages;
}

export const siteLanguages = LANGS;
