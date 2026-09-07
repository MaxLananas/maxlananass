import { SITE, PAGE_SIZE, galleryPath, projectPath } from "./site.js";
import { PROJECTS } from "./projects.js";
import { FILES } from "../gallery-data.js";
import dates from "./page-dates.json" with { type: "json" };
import { pageDates } from "./dates.js";

const profileLanguages = [{ lang: "en", path: "/about/" }, { lang: "fr", path: "/fr/a-propos/" }];
const iprofLanguages = [{ lang: "en", path: "/projects/iprof-redesign/" }, { lang: "fr", path: "/fr/projets/refonte-iprof/" }];

export function sitePages() {
  const pages = [
    { path: "/", title: "MaxLananas — Minecraft builder, developer & projects", heading: "MaxLananas", description: SITE.description, type: "WebPage", home: true },
    { path: "/about/", title: "About MaxLananas — Minecraft builder & developer", heading: "About MaxLananas", description: "Meet MaxLananas: Minecraft builder and developer working on BuildTheEarth contributions, client mods, server plugins, web tools and interface experiments.", type: "ProfilePage", alternates: profileLanguages },
    { path: "/fr/a-propos/", title: "MaxLananas — créateur Minecraft et développeur", heading: "À propos de MaxLananas", description: "Découvrez MaxLananas : créations Minecraft, contributions BuildTheEarth, mods, plugins, outils web et projets de développement. Portfolio et profils officiels.", type: "ProfilePage", lang: "fr", alternates: profileLanguages },
    { path: "/projects/", title: "Minecraft & software projects by MaxLananas", heading: "Projects by MaxLananas", description: "Explore MaxLananas’s iProf redesign, published Minecraft projects on Modrinth, software experiments and credited builds. Screenshots, video and source links.", type: "CollectionPage" },
    { path: "/buildtheearth/", title: "BuildTheEarth contributions & building tools | MaxLananas", heading: "BuildTheEarth: builds, tools and documentation", description: "Explore MaxLananas’s BuildTheEarth-related work: France build screenshots, TraceBTE, railway tools, projection-scale exploration and unofficial building guidelines.", type: "CollectionPage" },
    { path: "/development/", title: "Development — iProf redesign, Minecraft mods & software | MaxLananas", heading: "Development projects", description: "Explore MaxLananas’s iProf interface redesign, published Modrinth projects and GitHub experiments in Go, Assembly, C and interface development.", type: "CollectionPage" },
    { path: "/guides/minecraft-mods-plugins-addons/", title: "Minecraft mods, plugins & Axiom addons explained | MaxLananas", heading: "Mods, plugins and Axiom addons: where my tools run", description: "Choose the right environment for a Minecraft tool: compare Fabric client mods, Paper server plugins, Axiom addons and web tools using MaxLananas’s projects.", type: "Article", parent: "/development/" },
    { path: "/search/", title: "Search Minecraft builds | MaxLananas", heading: "Search the Minecraft gallery", description: "Search MaxLananas’s build screenshots by name, subject or collaboration, or browse the accessible photo catalogue and project pages.", type: "WebPage", home: true, noindex: true }
  ];
  for (const project of PROJECTS) pages.push({ path: projectPath(project.slug), title: project.title, heading: project.name, description: project.description, type: "WebPage", project, parent: "/projects/", ...(project.slug === "iprof-redesign" ? { caseStudy: true, alternates: iprofLanguages } : {}) });
  pages.push({ path: "/fr/projets/refonte-iprof/", lang: "fr", title: "Refonte iProf 2026 — étude de cas UI/UX | MaxLananas", heading: "Refonte iProf 2026", description: "Étude de cas de la refonte iProf par MaxLananas : parcours, tableau de bord, carrière, mobilité, documents, interfaces responsive et vidéo de démonstration.", type: "WebPage", caseStudy: true, alternates: iprofLanguages, project: PROJECTS.find(p => p.slug === "iprof-redesign"), parent: "/projects/" });
  for (let page = 1; page <= Math.ceil(FILES.length / PAGE_SIZE); page++) {
    const first = (page - 1) * PAGE_SIZE + 1;
    const last = Math.min(page * PAGE_SIZE, FILES.length);
    pages.push({ path: galleryPath(page), title: `Minecraft build screenshots${page > 1 ? ` — page ${page}` : ""} | MaxLananas`, heading: `Minecraft build screenshots${page > 1 ? ` — page ${page}` : ""}`, description: `Browse screenshots ${first}–${last} of ${FILES.length} in MaxLananas’s Minecraft portfolio. Read the image captions, collaboration credits and original-file links.`, type: "CollectionPage", galleryPage: page, parent: page > 1 ? "/builds/" : "/projects/" });
  }
  return pages.map((page) => ({ lang: "en", ...pageDates(page.path, dates), ...page }));
}
