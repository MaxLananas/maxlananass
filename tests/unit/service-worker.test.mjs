import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const workerSource = await readFile(new URL("../../sw.js", import.meta.url), "utf8");
const origin = "https://portfolio.test";
const scope = origin + "/portfolio/";
const imageURL = scope + "assets/gallery/0123456789abcdef-640.avif";
const pngResponse = (size = 50) => new Response(new Uint8Array(size), { headers: { "content-type": "image/avif" } });

function harness({ limit = 180, bytes = 48 * 1024 * 1024 } = {}) {
  const listeners = new Map();
  const stores = new Map();
  const calls = [];
  const key = (request) => new URL(typeof request === "string" ? request : request.url, scope).href;
  let fetcher = async () => pngResponse();
  let quota = false;
  class Cache {
    entries = new Map();
    async match(request) { return this.entries.get(key(request))?.clone(); }
    async put(request, response) {
      if (quota) throw new DOMException("Quota exceeded", "QuotaExceededError");
      this.entries.set(key(request), response.clone());
    }
    async keys() { return [...this.entries.keys()].map((url) => new Request(url)); }
    async delete(request) { return this.entries.delete(key(request)); }
    async addAll(requests) { for (const request of requests) await this.put(request, await fetcher(request)); }
  }
  const caches = {
    async open(name) { if (!stores.has(name)) stores.set(name, new Cache()); return stores.get(name); },
    async match(request, { cacheName } = {}) {
      if (cacheName) return stores.get(cacheName)?.match(request);
      for (const cache of stores.values()) { const hit = await cache.match(request); if (hit) return hit; }
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); }
  };
  const context = vm.createContext({
    URL, Request, Response, Headers, Blob, console, setTimeout, clearTimeout, caches,
    fetch: async (request, options) => { calls.push(key(request)); return fetcher(request, options); },
    self: {
      location: { href: scope + "sw.js", origin },
      registration: { navigationPreload: { enable: async () => {} } },
      clients: { claim: async () => {} },
      addEventListener: (name, handler) => listeners.set(name, handler)
    }
  });
  vm.runInContext(workerSource.replace("const IMAGE_CACHE_LIMIT = 180;", `const IMAGE_CACHE_LIMIT = ${limit};`)
    .replace("const IMAGE_BYTE_LIMIT = 48 * 1024 * 1024;", `const IMAGE_BYTE_LIMIT = ${bytes};`), context);

  async function dispatch(url, { method = "GET", mode = "cors", destination = "image", headers = {}, preloadResponse } = {}) {
    const waits = [];
    let result;
    const request = { url, method, mode, destination, headers: new Headers(headers) };
    listeners.get("fetch")({
      request, preloadResponse,
      respondWith: (promise) => { result = Promise.resolve(promise); },
      waitUntil: (promise) => waits.push(promise)
    });
    if (!result) return undefined;
    const response = await result;
    await Promise.all(waits);
    return response;
  }
  return {
    dispatch, caches, stores, calls, context,
    setFetch(fn) { fetcher = fn; },
    setQuota(value) { quota = value; },
    async lifecycle(name) {
      const waits = [];
      listeners.get(name)({ waitUntil: (promise) => waits.push(promise) });
      await Promise.all(waits);
    }
  };
}

test("a repeated viewed image is served from cache with ZERO revalidation requests", async () => {
  const h = harness();
  const first = await h.dispatch(imageURL);
  assert.equal(first.status, 200);
  const second = await h.dispatch(imageURL);
  assert.equal(second.status, 200);
  assert.equal(h.calls.length, 1);
  h.setFetch(async () => { throw new TypeError("Offline"); });
  assert.equal((await h.dispatch(imageURL)).status, 200);
  assert.equal(h.calls.length, 1);
});

test("proxy responses are cacheable, original GitHub downloads are never intercepted", async () => {
  const h = harness();
  const proxy = "https://wsrv.nl/?url=" + encodeURIComponent("https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/test.png") + "&w=640&output=webp";
  await h.dispatch(proxy);
  await h.dispatch(proxy);
  assert.equal(h.calls.length, 1);
  assert.equal(await h.dispatch("https://github.com/MaxLananas/Asset-Portfolio/releases/download/images-v1/test.png"), undefined);
  assert.equal(await h.dispatch("https://wsrv.nl/?url=https://unrelated.example/photo.png"), undefined);
});

test("image cache is bounded by both entry count and bytes", async () => {
  const h = harness({ limit: 3, bytes: 110 });
  for (let i = 0; i < 8; i++) await h.dispatch(imageURL + "?v=" + i);
  const cache = await h.caches.open("maxlananas-images-v7");
  const keys = await cache.keys();
  assert.equal(keys.length, 2);
  assert.equal(await cache.match(imageURL + "?v=0"), undefined);
  const total = await Promise.all(keys.map(async (key) => Number((await cache.match(key)).headers.get("x-portfolio-bytes"))));
  assert.ok(total.reduce((sum, size) => sum + size, 0) <= 110);
});

test("failed, HTML, opaque and oversized responses cannot poison the image cache", async () => {
  const h = harness();
  for (const response of [
    new Response("missing", { status: 404 }),
    new Response("error", { headers: { "content-type": "text/html" } }),
    new Response("too large", { headers: { "content-type": "image/png", "content-length": String(7 * 1024 * 1024) } })
  ]) {
    h.setFetch(async () => response.clone());
    await h.dispatch(imageURL);
    assert.equal((await (await h.caches.open("maxlananas-images-v7")).keys()).length, 0);
  }
  h.setFetch(async () => ({ ok: true, type: "opaque", clone() { return this; }, headers: new Headers({ "content-type": "image/png" }) }));
  await h.dispatch(imageURL);
  assert.equal((await (await h.caches.open("maxlananas-images-v7")).keys()).length, 0);
});

test("storage/quota errors do not stop a successful network image", async () => {
  const h = harness();
  h.setQuota(true);
  assert.equal((await h.dispatch(imageURL)).status, 200);
  assert.equal((await h.dispatch(imageURL)).status, 200);
  assert.equal(h.calls.length, 2);
});

test("activation deletes only this portfolio's obsolete caches", async () => {
  const h = harness();
  for (const name of ["another-app", "maxlananas-static-old", "maxlananas-images-v6", "maxlananas-images-v7", "maxlananas-static-source-v7"]) await h.caches.open(name);
  await h.lifecycle("activate");
  assert.deepEqual((await h.caches.keys()).sort(), ["another-app", "maxlananas-images-v7", "maxlananas-static-source-v7"]);
});

test("fresh HTML and unhashed scripts replace stale source deployments", async () => {
  const h = harness();
  const home = scope + "index.html";
  const cache = await h.caches.open("maxlananas-static-source-v7");
  await cache.put(home, new Response("old home", { headers: { "content-type": "text/html" } }));
  h.setFetch(async () => new Response("new home", { headers: { "content-type": "text/html" } }));
  const response = await h.dispatch(scope + "?q=castle", { mode: "navigate", destination: "document" });
  assert.equal(await response.text(), "new home");
  assert.equal(await (await cache.match(home)).text(), "new home");
  h.setFetch(async () => new Response("new script", { headers: { "content-type": "text/javascript" } }));
  await cache.put(scope + "script.js", new Response("old script"));
  assert.equal(await (await h.dispatch(scope + "script.js", { destination: "script" })).text(), "new script");
});

test("hashed build assets are immutable; unrelated APIs and range requests are ignored", async () => {
  const h = harness();
  h.setFetch(async () => new Response("script", { headers: { "content-type": "text/javascript" } }));
  const asset = scope + "assets/app-ABC12345.js";
  await h.dispatch(asset, { destination: "script" });
  await h.dispatch(asset, { destination: "script" });
  assert.equal(h.calls.length, 1);
  assert.equal(await h.dispatch(scope + "api/private", { destination: "", mode: "same-origin" }), undefined);
  assert.equal(await h.dispatch(imageURL, { method: "POST" }), undefined);
  assert.equal(await h.dispatch(imageURL, { headers: { range: "bytes=0-20" } }), undefined);
});

test("offline home query uses the shell, but missing paths remain 404, not the homepage", async () => {
  const h = harness();
  const cache = await h.caches.open("maxlananas-static-source-v7");
  await cache.put(scope + "index.html", new Response("portfolio", { headers: { "content-type": "text/html" } }));
  await cache.put(scope + "404.html", new Response("not found", { headers: { "content-type": "text/html" } }));
  h.setFetch(async () => { throw new TypeError("Offline"); });
  const home = await h.dispatch(scope + "?q=montagne", { mode: "navigate", destination: "document" });
  assert.equal(await home.text(), "portfolio");
  const missing = await h.dispatch(scope + "missing/deep/page", { mode: "navigate", destination: "document" });
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "not found");
});

test("navigation preload is reused rather than fetching the document twice", async () => {
  const h = harness();
  const preload = new Response("preloaded", { headers: { "content-type": "text/html" } });
  const result = await h.dispatch(scope, { mode: "navigate", destination: "document", preloadResponse: Promise.resolve(preload) });
  assert.equal(await result.text(), "preloaded");
  assert.equal(h.calls.length, 0);
});
