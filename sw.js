/* Only the small application shell is precached. Photos enter the bounded cache
   when viewed, never as a bulk offline download. The build injects hashed assets. */
const STATIC_VERSION = "source-v8";
const STATIC_CACHE = "maxlananas-static-" + STATIC_VERSION;
const IMAGE_CACHE = "maxlananas-images-v7";
const IMAGE_CACHE_LIMIT = 180;
const IMAGE_BYTE_LIMIT = 48 * 1024 * 1024;
const IMAGE_ENTRY_LIMIT = 6 * 1024 * 1024;
const STATIC_ASSETS = /* precache:start */ [
  "./", "./index.html", "./style.css", "./script.js", "./gallery-data.js",
  "./page.js", "./project-viewer.js", "./image-labels.js", "./image-manifest.js", "./image-utils.js", "./image-loader.js", "./load-queue.js", "./lightbox.js",
  "./assets/icons/favicon-96.png", "./assets/fonts/FFFlauta-200.woff2", "./apple-touch-icon.png", "./manifest.json", "./404.html", "./404.css",
  "./assets/credits/bte.webp", "./assets/credits/endorah.webp", "./assets/credits/fight4glory.webp", "./assets/credits/mrbeast.webp"
] /* precache:end */;
const PAGE_PATHS = /* pages:start */ ["","about/","fr/a-propos/","projects/","buildtheearth/","development/","guides/minecraft-mods-plugins-addons/","search/","projects/iprof-redesign/","projects/colorflow/","projects/nostalgia-ultra/","projects/sculk-vision/","projects/jukeboxplus/","projects/now-playing-irl/","projects/homegui/","projects/railway-tools-axiom/","projects/bidvault/","projects/bedrock-height-guard/","projects/deathpoint/","projects/sentinel/","projects/maxos/","projects/pineappleui/","projects/tracebte/","projects/bte-distortion-calculator/","projects/bte-france-guidelines/","projects/builders-utilities-bt-corsica/","projects/le-mans/","fr/projets/refonte-iprof/","builds/","builds/page/2/","builds/page/3/","builds/page/4/","builds/page/5/","builds/page/6/","builds/page/7/"] /* pages:end */;
const ROOT = new URL("./", self.location.href);
const HOME = new URL("./index.html", ROOT).href;
const NOT_FOUND = new URL("./404.html", ROOT).href;
const staticURLs = new Set(STATIC_ASSETS.map((path) => new URL(path, ROOT).href));

self.addEventListener("install", (event) => {
  // An incomplete installation must not replace a working offline version.
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS.map((asset) =>
    new Request(new URL(asset, ROOT), { cache: "no-cache" })
  ))));
  // No forced skipWaiting/reload: an open tab keeps its matching code and cache.
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("maxlananas-") && key !== STATIC_CACHE && key !== IMAGE_CACHE)
      .map((key) => caches.delete(key)));
    // Never delete caches owned by another application on this origin.
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

async function cached(request, cacheName = STATIC_CACHE) {
  try { return await caches.match(request, { cacheName }); } catch (_) { return undefined; }
}

async function storeStatic(request, response) {
  if (!response.ok || response.type === "opaque") return;
  try {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response);
  } catch (_) { /* Storage-disabled/private browsing must still work online. */ }
}

let imageWrites = Promise.resolve();
let imageIndex;
let imageBytes = 0;
async function storeImage(request, response) {
  if (!response.ok || response.type === "opaque" || !response.headers.get("content-type")?.startsWith("image/")) return;
  if (Number(response.headers.get("content-length")) > IMAGE_ENTRY_LIMIT) return;
  try {
    const blob = await response.blob();
    if (!blob.size || blob.size > IMAGE_ENTRY_LIMIT) return;
    const cache = await caches.open(IMAGE_CACHE);
    if (!imageIndex) {
      const keys = await cache.keys();
      const entries = await Promise.all(keys.map(async (key) => [key.url, Number((await cache.match(key))?.headers.get("x-portfolio-bytes")) || 0]));
      imageIndex = new Map(entries);
      imageBytes = entries.reduce((sum, [, size]) => sum + size, 0);
    }
    const headers = new Headers(response.headers);
    headers.set("x-portfolio-bytes", String(blob.size));
    headers.set("content-length", String(blob.size));
    headers.delete("content-encoding");
    // Evict before writing as well, to avoid needless QuotaExceededError failures.
    while (imageIndex.size && (imageIndex.size >= IMAGE_CACHE_LIMIT || imageBytes + blob.size > IMAGE_BYTE_LIMIT)) {
      const oldest = imageIndex.keys().next().value;
      await cache.delete(oldest);
      imageBytes -= imageIndex.get(oldest);
      imageIndex.delete(oldest);
    }
    await cache.put(request, new Response(blob, { status: 200, headers }));
    imageBytes += blob.size - (imageIndex.get(request.url) || 0);
    imageIndex.set(request.url, blob.size);
  } catch (_) {
    imageIndex = null; // Rebuild the index if the browser evicts storage itself.
  }
}

function imageResponse(event) {
  let write = Promise.resolve();
  const response = (async () => {
    const hit = await cached(event.request, IMAGE_CACHE);
    if (hit) return hit; // Immutable variant: NO background redownload on cache hits.
    const result = await fetch(event.request);
    const copy = result.clone();
    write = imageWrites = imageWrites.then(() => storeImage(event.request, copy)).catch(() => {});
    return result;
  })();
  event.respondWith(response);
  // Keep writes alive after returning the image; never make paint wait for cache I/O.
  event.waitUntil(response.then(() => write).catch(() => {}));
}

function navigationKey(url) {
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return null;
  const path = url.pathname.slice(ROOT.pathname.length).replace(/index\.html$/, "");
  return PAGE_PATHS.includes(path) ? new URL(path + "index.html", ROOT).href : null;
}

async function navigationResponse(request, network) {
  const url = new URL(request.url);
  const key = navigationKey(url);
  const hit = key ? (await cached(key) || (key === HOME ? await cached(ROOT.href) : undefined)) : undefined;
  if (!hit) {
    try { return await network; } catch (_) {
      if (!key) {
        const missing = await cached(NOT_FOUND);
        if (missing) return new Response(missing.body, { status: 404, headers: missing.headers });
      }
      return new Response("Offline. Please reconnect to load this page.", {
        status: 503, headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
  let timer;
  try {
    // Fast return visits even on flaky internet; a successful network response still
    // refreshes the HTML for the next visit. The original query string is preserved.
    return await Promise.race([
      network.catch(() => hit),
      new Promise((resolve) => { timer = setTimeout(() => resolve(hit), 2000); })
    ]);
  } finally { clearTimeout(timer); }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  // Let HTTP byte ranges and the browser media cache handle video. Never copy
  // an entire movie into the application CacheStorage budget.
  if (request.destination === "video" || request.destination === "audio" || url.pathname.startsWith(ROOT.pathname + "assets/video/")) return;
  if (request.mode === "navigate" && url.origin === ROOT.origin) {
    const network = (async () => {
      let preload;
      try { preload = await event.preloadResponse; } catch (_) {}
      const response = preload || await fetch(request, { cache: "no-cache" });
      const key = navigationKey(url);
      if (key && response.ok && response.headers.get("content-type")?.includes("text/html")) {
        await storeStatic(key, response.clone());
      }
      return response;
    })();
    event.waitUntil(network.catch(() => {}));
    event.respondWith(navigationResponse(request, network));
    return;
  }
  const isGallery = url.origin === ROOT.origin && (url.pathname.startsWith(ROOT.pathname + "assets/gallery/") || url.pathname.startsWith(ROOT.pathname + "assets/projects/"));
  const isProxy = url.hostname === "wsrv.nl" &&
    (url.searchParams.get("url") || "").startsWith("https://github.com/MaxLananas/Asset-Portfolio/releases/download/");
  if (request.destination === "image" && (isGallery || isProxy)) {
    imageResponse(event);
    return;
  }
  if (url.origin !== ROOT.origin) return; // Do not cache opaque, multi-megabyte release originals.
  const cleanURL = new URL(url);
  cleanURL.search = "";
  const isAsset = url.pathname.startsWith(ROOT.pathname + "assets/");
  if (!staticURLs.has(cleanURL.href) && !isAsset) return;
  const immutable = isAsset && /[-.][\w-]{8,}\.(?:js|css|woff2)$/.test(url.pathname);
  let write = Promise.resolve();
  const result = (async () => {
    const hit = await cached(request);
    if (hit && immutable) return hit;
    try {
      // Unhashed source files must not get stuck on an old deployment forever.
      const response = await fetch(request, { cache: immutable ? "default" : "no-cache" });
      write = storeStatic(request, response.clone());
      return response;
    } catch (error) {
      if (hit) return hit;
      throw error;
    }
  })();
  event.respondWith(result);
  event.waitUntil(result.then(() => write).catch(() => {}));
});
