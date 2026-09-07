// Public identity only. Do not infer a legal name, address, employer or official BTE role.
export const SITE = {
  url: "https://maxlananas.is-a.dev/",
  name: "MaxLananas",
  language: "en",
  reviewed: "2026-09-07",
  // Public verification values; leave empty until supplied by the property owner.
  verification: { google: "", bing: "" },
  description: "Minecraft builds, BuildTheEarth contributions, mods, plugins and developer tools by MaxLananas. Explore the projects, screenshots and source repositories.",
  github: "https://github.com/MaxLananas",
  instagram: "https://www.instagram.com/maxlananas.builds/",
  discord: "https://discord.gg/pnJhKuU2QK",
  bte: "https://buildtheearth.net/"
};
export const PAGE_SIZE = 16;
export const canonical = (path = "/") => new URL(path.replace(/^\//, ""), SITE.url).href;
export const projectPath = (slug) => `/projects/${slug}/`;
export const galleryPath = (page) => page === 1 ? "/builds/" : `/builds/page/${page}/`;
