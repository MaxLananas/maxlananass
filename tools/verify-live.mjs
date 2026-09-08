import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import { SITE, canonical } from "../content/site.js";
import { sitePages } from "../content/pages.js";
import { contentVersion } from "./content-version.mjs";
import video from "../content/iprof-video.json" with { type: "json" };

export async function verifyLive({ origin = SITE.url, fetcher = fetch, expectedVersion, attempts = 1, delay = 15000, sleep = (ms) => new Promise(r => setTimeout(r, ms)) } = {}) {
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 12 || !Number.isInteger(delay) || delay < 0 || delay > 30000) throw new Error("Invalid bounded verification retry policy");
  const base = new URL(origin);
  if (base.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(base.hostname)) throw new Error("Use HTTPS for a public deployment");
  const preview = /(?:\.pages\.dev|\.e2b\.app)$/.test(base.hostname);
  const version = expectedVersion || await contentVersion();
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await verifyOnce({ base, preview, fetcher, version });
      return { ...result, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.warn(`Publication check ${attempt}/${attempts}: ${error.message}. Retrying after propagation delay.`);
        await sleep(delay);
      }
    }
  }
  throw new Error(`Public deployment verification failed after ${attempts} attempt(s): ${lastError.message}`, { cause: lastError });
}

async function verifyOnce({ base, preview, fetcher, version }) {
  const pages = sitePages();
  const report = new Array(pages.length);
  const assets = new Set();
  let cursor = 0;
  const request = (path, options = {}) => fetcher(new URL(path.replace(/^\//, ""), base), { cache: "no-cache", signal: AbortSignal.timeout(12000), ...options });
  async function worker() {
    while (cursor < pages.length) {
      const index = cursor++, page = pages[index];
      const response = await request(page.path);
      if (response.status !== 200) throw new Error(`${page.path}: HTTP ${response.status}`);
      const $ = load(await response.text());
      if ($("title").text() !== page.title) throw new Error(`${page.path}: old or unexpected deployment`);
      if ($("meta[name='portfolio-content-version']").attr("content") !== version) throw new Error(`${page.path}: stale content fingerprint`);
      if (SITE.verification.google && $("meta[name='google-site-verification']").attr("content") !== SITE.verification.google) throw new Error(`${page.path}: missing requested Google verification`);
      if (!page.noindex && $("link[rel=canonical]").attr("href") !== canonical(page.path)) throw new Error(`${page.path}: incorrect canonical`);
      if (page.noindex && !$("meta[name=robots]").attr("content")?.includes("noindex")) throw new Error(`${page.path}: search must stay noindex`);
      if (!page.noindex && $("meta[name=robots]").attr("content")?.includes("noindex")) throw new Error(`${page.path}: production HTML is noindex`);
      const robots = response.headers.get("x-robots-tag") || "";
      if (preview && !robots.includes("noindex")) throw new Error(`${page.path}: publicly indexable preview`);
      if (!preview && !page.noindex && robots.includes("noindex")) throw new Error(`${page.path}: production is blocked by X-Robots-Tag`);
      for (const element of $("script[src], link[rel=stylesheet], link[rel=preload], link[rel=modulepreload]").toArray()) {
        const url = new URL($(element).attr("src") || $(element).attr("href"), base);
        if (url.origin === base.origin) assets.add(url.pathname);
      }
      const firstImage = $("img[src]").filter((_, img) => $(img).attr("src")?.startsWith("/")).first().attr("src");
      if (firstImage) assets.add(firstImage);
      report[index] = { path: page.path, status: response.status, canonical: $("link[rel=canonical]").attr("href") || null, robots };
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  for (const asset of [...assets, "/assets/icons/favicon-96.png", "/assets/social/portfolio.png"]) {
    const response = await request(asset, { method: "HEAD" });
    if (!response.ok) throw new Error(`${asset}: HTTP ${response.status}`);
  }
  for (const file of ["robots.txt", "sitemap.xml", "sitemap-images.xml"]) {
    const response = await request(file);
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    const body = await response.text();
    if (!body.includes(SITE.url)) throw new Error(`${file}: wrong sitemap origin`);
    if (file === "robots.txt" && /^Disallow:\s*\/\s*$/m.test(body)) throw new Error("robots.txt blocks the entire site");
  }
  const media = await request(video.file, { headers: { range: "bytes=0-1023" } });
  if (media.status !== 206 || !media.headers.get("content-type")?.startsWith("video/mp4") || media.headers.get("content-range") !== `bytes 0-1023/${video.bytes}`) {
    await media.body?.cancel();
    throw new Error("Native video byte-range delivery is not ready");
  }
  if ((await media.arrayBuffer()).byteLength !== 1024) throw new Error("Truncated native video range");
  const missing = await request("__seo-check-nonexistent__/deep/", { redirect: "manual" });
  if (missing.status !== 404) throw new Error(`Missing URL must be HTTP 404, not ${missing.status}`);
  return { origin: base.href, preview, version, pages: report.length, assetsChecked: assets.size, checks: report, missingStatus: 404, videoRangeStatus: 206 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const option = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : process.argv[i + 1]; };
  console.log(JSON.stringify(await verifyLive({ origin: option("--origin", SITE.url), attempts: Number(option("--attempts", 1)), delay: Number(option("--delay", 15000)) }), null, 2));
}
