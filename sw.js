const STATIC_CACHE = "maxlananas-static-v4";
const IMAGE_CACHE = "maxlananas-images-v4";
const IMAGE_CACHE_LIMIT = 90;

const STATIC_ASSETS = ["./", "./index.html", "./style.css", "./script.js", "./FFFlauta-200.otf", "./apple-touch-icon.png", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) { await cache.delete(keys[0]); await trimCache(cacheName, maxItems); }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response && response.status === 200) { cache.put(request, response.clone()); trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT); }
    return response;
  }).catch(() => cached);
  return cached || network;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) { const cache = await caches.open(STATIC_CACHE); cache.put(request, response.clone()); }
    return response;
  } catch (e) { return cached; }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.hostname === "wsrv.nl") { event.respondWith(staleWhileRevalidate(request)); return; }
  if (url.origin === self.location.origin) event.respondWith(cacheFirst(request));
});
