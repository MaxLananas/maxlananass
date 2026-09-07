import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import { SITE, canonical } from "../content/site.js";
import { sitePages } from "../content/pages.js";

// Read-only verification AFTER deployment. No ping, submission, account access
// or ranking claim. This intentionally fails against an older published version.
export async function verifyLive({ origin = SITE.url, fetcher = fetch } = {}) {
  const base = new URL(origin);
  if (base.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(base.hostname)) throw new Error("Use HTTPS for a public deployment");
  const preview = /(?:\.pages\.dev|\.e2b\.app)$/.test(base.hostname);
  const report = [];
  for (const page of sitePages()) {
    const response = await fetcher(new URL(page.path.slice(1), base), { cache: "no-cache", signal: AbortSignal.timeout(15000) });
    if (response.status !== 200) throw new Error(`${page.path}: HTTP ${response.status}`);
    const $ = load(await response.text());
    if ($("title").text() !== page.title) throw new Error(`${page.path}: old or unexpected deployment`);
    if (!page.noindex && $("link[rel=canonical]").attr("href") !== canonical(page.path)) throw new Error(`${page.path}: incorrect canonical`);
    if (page.noindex && !$("meta[name=robots]").attr("content")?.includes("noindex")) throw new Error(`${page.path}: search must stay noindex`);
    const robotHeader = response.headers.get("x-robots-tag") || "";
    if (preview && !robotHeader.includes("noindex")) throw new Error(`${page.path}: publicly indexable preview`);
    if (!preview && !page.noindex && robotHeader.includes("noindex")) throw new Error(`${page.path}: production is blocked by X-Robots-Tag`);
    report.push({ path: page.path, status: response.status, canonical: $("link[rel=canonical]").attr("href") || null, robots: robotHeader });
  }
  for (const file of ["robots.txt", "sitemap.xml", "sitemap-images.xml", "assets/icons/favicon-96.png", "assets/social/portfolio.png"]) {
    const response = await fetcher(new URL(file, base), { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    if (file.endsWith(".xml") && !(await response.text()).includes(SITE.url)) throw new Error(`${file}: wrong sitemap origin`);
  }
  const missing = await fetcher(new URL("__seo-check-nonexistent__/deep/", base), { redirect: "manual", signal: AbortSignal.timeout(15000) });
  if (missing.status !== 404) throw new Error(`Missing URL must be HTTP 404, not ${missing.status}`);
  return { origin: base.href, preview, pages: report.length, checks: report, missingStatus: 404 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const index = process.argv.indexOf("--origin");
  console.log(JSON.stringify(await verifyLive({ origin: index >= 0 ? process.argv[index + 1] : SITE.url }), null, 2));
}
