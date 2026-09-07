import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { FILES } from "../../gallery-data.js";

const manifest = JSON.parse(await readFile(".cache/test-manifest.json", "utf8"));
const originalFixture = await readFile(".cache/test-site/assets/test/original.png");
const sourceURL = "http://127.0.0.1:4175/";

async function configure(page, profile = { effectiveType: "4g", downlink: 2, rtt: 200, saveData: false }, order = FILES.map((_, i) => i)) {
  await page.addInitScript(({ profile, order }) => {
    const connection = Object.assign(new EventTarget(), profile);
    Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
    // Deterministic only in tests. The live portfolio keeps its session shuffle.
    try { sessionStorage.setItem("portfolio-order", JSON.stringify(order)); } catch (_) {}
    window.__layoutShifts = [];
    if (typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value);
      }).observe({ type: "layout-shift", buffered: true });
    }
  }, { profile, order });
}
async function ready(page) {
  await expect(page.locator(".tile")).toHaveCount(FILES.length);
  await expect(page.locator(".tile img.loaded").first()).toBeVisible();
}
async function openFirst(page) {
  await page.locator(".tile:not([hidden])").first().click();
  await expect(page.locator("#lightbox")).toHaveClass(/open/);
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
}

test("the prepared gallery is stable, sharp, lazy and has no third-party image dependency", async ({ page }) => {
  await configure(page);
  const errors = [];
  const externalImages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.resourceType() === "image" && !request.url().startsWith("http://127.0.0.1:4174/") && !request.url().startsWith("data:")) externalImages.push(request.url());
  });
  await page.goto("/");
  await ready(page);
  await expect(page.locator('#masonry[aria-busy="false"]')).toHaveCount(1);
  await expect.poll(() => page.locator(".tile img.loaded").count()).toBeGreaterThan(2);
  const state = await page.evaluate(() => ({
    loaded: document.querySelectorAll(".tile img.loaded").length,
    shift: window.__layoutShifts.reduce((sum, value) => sum + value, 0),
    blob: [...document.querySelectorAll(".tile img")].some((img) => img.src.startsWith("blob:")),
    overflow: document.documentElement.scrollWidth > innerWidth
  }));
  expect(state.loaded).toBeLessThan(45);
  expect(state.shift).toBeLessThan(.02);
  expect(state.blob).toBe(false);
  expect(state.overflow).toBe(false);
  expect(externalImages).toEqual([]);
  expect(errors).toEqual([]);
  const first = page.locator('.tile[data-index="0"]');
  const ratio = await first.evaluate((tile) => tile.getBoundingClientRect().width / tile.getBoundingClientRect().height);
  expect(ratio).toBeCloseTo(manifest[FILES[0].name].width / manifest[FILES[0].name].height, 2);
  expect(await first.locator("img").getAttribute("width")).toBe(String(manifest[FILES[0].name].width));
});

test("filters, date sorting, shuffle, density and credit links survive", async ({ page }) => {
  await configure(page);
  await page.goto("/");
  await ready(page);
  await page.locator('[data-filter="collab"]').click();
  await expect(page.locator("#resultsCount")).toHaveText("Showing 41 of 101 builds");
  await expect(page.locator('.tile[data-credit="original"]:not([hidden])')).toHaveCount(0);
  await page.locator('[data-filter="original"]').click();
  await expect(page.locator("#resultsCount")).toHaveText("Showing 60 of 101 builds");
  await page.locator('[data-filter="all"]').click();
  await page.locator("#sortToggle").click();
  await expect(page.locator("#sortLabel")).toHaveText("Newest");
  await expect(page.locator(".tile").first()).toHaveAttribute("data-index", "69");
  await page.locator("#sortToggle").click();
  await expect(page.locator("#sortLabel")).toHaveText("Oldest");
  await expect(page.locator(".tile").first()).toHaveAttribute("data-index", "0");
  const order = await page.locator(".tile").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.index));
  await page.locator("#shuffleBtn").click();
  await expect(page.locator("#sortLabel")).toHaveText("Featured");
  expect(await page.locator(".tile").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.index))).not.toEqual(order);
  await page.locator("#densityToggle").click();
  await expect(page.locator("#densityPopover")).toBeVisible();
  await page.locator('.seg[data-density="compact"]').click();
  await expect(page.locator("#masonry")).toHaveAttribute("data-density", "compact");
  await expect(page.locator("#densityPopover")).toBeHidden();
  await expect(page.locator(".footer-credit-chip")).toHaveCount(4);
  await expect(page.locator('.footer-credit-chip[href="https://endorah.net/"]')).toHaveCount(1);
});

test("search handles accents, empty results, deep links and Enter without reloading", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.viewport.width < 700, "Search is intentionally hidden on mobile, as in the original design");
  await configure(page);
  await page.goto("/?q=ch%C3%A2teau");
  await ready(page);
  await expect(page.locator("#searchInput")).toHaveValue("château");
  const hits = await page.locator(".tile:not([hidden])").count();
  expect(hits).toBeGreaterThan(0);
  expect(hits).toBeLessThan(FILES.length);
  await page.evaluate(() => { window.__noReloadMarker = "preserved"; });
  await page.locator("#searchInput").fill("ZZZ-no-such-build");
  await page.locator("#searchInput").press("Enter");
  await expect(page.locator("#emptyResults")).toBeVisible();
  await expect(page.locator("#resultsCount")).toHaveText("Showing 0 of 101 builds");
  expect(await page.evaluate(() => window.__noReloadMarker)).toBe("preserved");
  await page.locator("#clearSearch").click();
  await expect(page.locator("#clearSearch")).toBeHidden();
  await expect(page.locator("#resultsCount")).toHaveText("Showing 101 of 101 builds");
  expect(new URL(page.url()).searchParams.has("q")).toBe(false);
});

test("the lightbox follows the displayed order, retains credits and restores keyboard focus", async ({ page }) => {
  await configure(page);
  await page.goto("/");
  await ready(page);
  await page.locator('[data-filter="collab"]').click();
  const visible = await page.locator(".tile:not([hidden])").evaluateAll((tiles) => tiles.map((tile) => Number(tile.dataset.index)));
  const trigger = page.locator(`.tile[data-index="${visible[0]}"]`);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await expect(page.locator("#lbCaption")).toContainText("BuildTheEarth France");
  await expect(page.locator("#lbCounter")).toHaveText("1 / 41");
  await expect(page.locator("#lbOriginal")).toHaveAttribute("href", /github\.com\/MaxLananas\/Asset-Portfolio\/releases\/download\/images-v1\//);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", new RegExp(`#${String(visible[1] + 1).padStart(3, "0")}`));
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await page.locator("#lbClose").focus();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => document.getElementById("lightbox").contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#lightbox")).not.toHaveClass(/open/);
  await expect(trigger).toBeFocused();
  expect(await page.locator("main").evaluate((element) => element.inert)).toBe(false);
  expect(await page.locator("body").evaluate((element) => element.style.overflow)).toBe("");
});

test("rapid navigation/closing never installs a stale lightbox image", async ({ page }) => {
  await configure(page);
  await page.goto("/");
  await ready(page);
  await page.route("**/assets/gallery/**", async (route) => {
    if (/-960\.|-1280\.|-1600\./.test(route.request().url())) await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue().catch(() => {});
  });
  await page.locator(".tile").first().click();
  await expect(page.locator("#lightbox")).toHaveClass(/open/);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#003/);
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await page.keyboard.press("Escape");
  await page.locator('.tile[data-index="0"]').click();
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#001/);
  await expect(page.locator("#lbSpinner")).toBeHidden();
});

test("a slow/save-data connection loads only the viewport and never speculative HD neighbours", async ({ page, context, browserName }) => {
  await configure(page, { effectiveType: "2g", downlink: .4, rtt: 450, saveData: true });
  if (browserName === "chromium") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 180, downloadThroughput: 60000, uploadThroughput: 30000 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await page.goto("/");
  await ready(page);
  await expect.poll(() => page.locator(".tile img.loaded").count()).toBeGreaterThan(1);
  const outside = await page.locator(".tile img.loaded").evaluateAll((images) => images.filter((image) => {
    const box = image.closest(".tile").getBoundingClientRect();
    return box.top >= innerHeight + 1 || box.bottom <= 0;
  }).length);
  expect(outside).toBe(0);
  await openFirst(page);
  // Allow the optional idle neighbour timer to pass; save-data must forbid it.
  const requests = [];
  page.on("request", (request) => { if (request.url().includes("/assets/gallery/")) requests.push(request.url()); });
  await page.waitForTimeout(1300);
  expect(requests).toEqual([]);
});

test("broken AVIF falls back once to WebP, not an endless error loop", async ({ page }) => {
  await configure(page);
  const requests = [];
  page.on("request", (request) => { if (request.resourceType() === "image") requests.push(request.url()); });
  await page.route("**/assets/gallery/*.avif", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  await ready(page);
  await expect.poll(() => page.locator(".tile img.loaded").first().evaluate((img) => img.currentSrc)).toMatch(/\.webp$/);
  expect(requests.some((url) => url.includes("wsrv.nl") || url.includes("releases/download"))).toBe(false);
});

test("all delivery paths failing leaves usable fallback links, a finite queue, and a recoverable viewer", async ({ page }) => {
  await configure(page);
  await page.goto("/");
  await ready(page);
  const attempts = [];
  await page.route("**/assets/gallery/**", (route) => { attempts.push(route.request().url()); return route.fulfill({ status: 404, body: "missing" }); });
  await page.route("https://wsrv.nl/**", (route) => { attempts.push(route.request().url()); return route.fulfill({ status: 404, headers: { "access-control-allow-origin": "*" }, body: "missing" }); });
  await page.route("https://github.com/**/releases/download/**", (route) => { attempts.push(route.request().url()); return route.fulfill({ status: 404, body: "missing" }); });
  await page.locator(".tile").first().click();
  await expect(page.locator("#lbRetry")).toBeVisible();
  await expect(page.locator("#lbSpinner")).toBeHidden();
  await expect(page.locator("#lbPreview")).toBeVisible();
  await expect(page.locator("#lbOriginal")).toBeVisible();
  const stoppedAt = attempts.length;
  await page.waitForTimeout(200);
  expect(attempts.length).toBe(stoppedAt);
  await page.unroute("**/assets/gallery/**");
  await page.locator("#lbRetry").click();
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await expect(page.locator("#lbStatus")).toBeEmpty();
});

test("fast scroll away and back does not strand blank or cancelled tiles", async ({ page }) => {
  await configure(page);
  await page.route("**/assets/gallery/**", async (route) => { await new Promise((resolve) => setTimeout(resolve, 100)); await route.continue().catch(() => {}); });
  await page.goto("/");
  await expect(page.locator(".tile")).toHaveCount(101);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 2200); });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.tile[data-index="0"] img')).toHaveClass(/loaded/);
  const hasFailure = await page.locator('.tile[data-index="0"]').getAttribute("data-state");
  expect(hasFailure).toBe("loaded");
});

test("legacy publication still works through native WebP without object URLs or API metadata requests", async ({ page }) => {
  await configure(page);
  const urls = [];
  await page.route("https://wsrv.nl/**", (route) => {
    urls.push(new URL(route.request().url()));
    return route.fulfill({ status: 200, contentType: "image/png", headers: { "access-control-allow-origin": "*" }, body: originalFixture });
  });
  await page.goto(sourceURL);
  await ready(page);
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.every((url) => url.searchParams.get("output") === "webp" && url.searchParams.get("q") === "90")).toBe(true);
  expect(urls.some((url) => url.searchParams.get("output") === "json")).toBe(false);
  expect(await page.locator(".tile img.loaded").first().evaluate((img) => img.currentSrc.startsWith("blob:"))).toBe(false);
  await openFirst(page);
  await page.keyboard.press("Escape");
});

test("storage restrictions and missing IntersectionObserver do not break browsing", async ({ page }) => {
  await configure(page);
  await page.addInitScript(() => {
    delete window.IntersectionObserver;
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Blocked", "SecurityError"); } });
    Object.defineProperty(window, "sessionStorage", { configurable: true, get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/");
  await ready(page);
  expect(await page.locator(".tile img.loaded").count()).toBeLessThan(45);
  await openFirst(page);
  await page.keyboard.press("Escape");
});

test("keyboard tabs, a single-result viewer, and reduced motion remain usable", async ({ page }) => {
  await configure(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?q=pot%20de%20fleur");
  await ready(page);
  await expect(page.locator(".tile:not([hidden])")).toHaveCount(1);
  await openFirst(page);
  await expect(page.locator("#lbNext")).toBeDisabled();
  await expect(page.locator("#lbPrev")).toBeDisabled();
  await page.keyboard.press("Escape");
  await page.locator('[data-filter="all"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-filter="original"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-filter="original"]')).toBeFocused();
});

test.describe("service worker", () => {
  test.use({ serviceWorkers: "allow" });
  test("keeps other caches, reuses viewed images and reloads the site offline", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Deterministic offline/SW coverage runs in Chromium; strategy also has isolated unit tests");
    await configure(page);
    await page.goto("/manifest.json");
    await page.evaluate(async () => { const cache = await caches.open("another-application"); await cache.put("/keep-me", new Response("keep")); });
    await page.goto("/");
    await ready(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    expect(await page.evaluate(() => caches.has("another-application"))).toBe(true);
    await page.reload();
    await ready(page);
    await expect.poll(() => page.evaluate(async () => (await (await caches.open("maxlananas-images-v7")).keys()).length)).toBeGreaterThan(0);
    await openFirst(page);
    await page.keyboard.press("Escape");
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await expect(page.locator('.tile[data-index="0"] img')).toHaveClass(/loaded/);
    await openFirst(page);
    await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#001/);
    await page.keyboard.press("Escape");
    await page.goto("/not-a-real-page/deep");
    await expect(page.locator("h1")).toHaveText("404");
  });
});

test("a fast connection warms only the next displayed photo and reuses that request", async ({ page }) => {
  const order = [0, 2, 1, ...FILES.map((_, i) => i).slice(3)];
  await configure(page, { effectiveType: "4g", downlink: 10, rtt: 50, saveData: false }, order);
  const nextPrefix = manifest[FILES[2].name].base + "-768.";
  const nextRequests = [];
  page.on("request", (request) => { if (request.url().includes(nextPrefix)) nextRequests.push(request.url()); });
  await page.goto("/");
  await ready(page);
  await openFirst(page);
  await expect.poll(() => nextRequests.length).toBe(1);
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#003/);
  expect(nextRequests.length).toBe(1);
});

test("Retina upgrades are queued only when an already-viewed tile becomes visible again", async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== "chromium" || testInfo.project.use.viewport.width < 700, "Desktop Chromium CDP controls the device pixel ratio");
  await configure(page);
  await page.goto("/");
  await ready(page);
  const first = page.locator('.tile[data-index="0"] img');
  await expect(first).toHaveClass(/loaded/);
  const before = await first.evaluate((img) => img.currentSrc);
  expect(before).toMatch(/-320\./);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 2200); });
  await expect.poll(() => first.evaluate((img) => img.getBoundingClientRect().bottom)).toBeLessThan(0);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1439, height: 900, deviceScaleFactor: 2, mobile: false });
  await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(2);
  await page.waitForTimeout(250);
  expect(await first.evaluate((img) => img.currentSrc)).toBe(before);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => first.evaluate((img) => img.currentSrc)).toMatch(/-640\./);
  await expect(page.locator('.tile[data-index="0"]')).toHaveAttribute("data-state", "loaded");
  // The low-resolution placeholder is removed after the fade, including for alpha images.
  await expect.poll(() => page.locator('.tile[data-index="0"]').evaluate((tile) => tile.style.backgroundImage)).toBe("");
});

test("the real featured shuffle is stable across reloads in the same session", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const order = await page.locator(".tile").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.index));
  await page.reload();
  await ready(page);
  expect(await page.locator(".tile").evaluateAll((tiles) => tiles.map((tile) => tile.dataset.index))).toEqual(order);
});

test("without JavaScript the original album and contact links remain available", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4174/");
    await expect(page.locator('noscript a[href*="releases/tag/images-v1"]')).toBeVisible();
    await expect(page.locator(".discord-cta")).toHaveAttribute("href", "https://discord.gg/pnJhKuU2QK");
  } finally { await context.close(); }
});

test("horizontal swipes navigate, vertical drags and multitouch do not", async ({ page }) => {
  await configure(page);
  await page.goto("/");
  await ready(page);
  await openFirst(page);
  async function gesture(start, end, multitouch = false) {
    await page.evaluate(({ start, end, multitouch }) => {
      const target = document.getElementById("lightbox");
      const first = new Event("touchstart", { bubbles: true });
      first.touches = multitouch ? [start, start] : [start];
      first.changedTouches = [start];
      target.dispatchEvent(first);
      const last = new Event("touchend", { bubbles: true });
      last.touches = [];
      last.changedTouches = [end];
      target.dispatchEvent(last);
    }, { start, end, multitouch });
  }
  await gesture({ clientX: 280, clientY: 400 }, { clientX: 100, clientY: 410 });
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#002/);
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  await gesture({ clientX: 220, clientY: 600 }, { clientX: 160, clientY: 200 });
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#002/);
  await gesture({ clientX: 280, clientY: 400 }, { clientX: 100, clientY: 410 }, true);
  await expect(page.locator("#lbImg")).toHaveAttribute("alt", /#002/);
});

test("photos and credits fit short landscape screens without re-downloading on shrink", async ({ page }) => {
  await configure(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/?q=buildtheearth");
  await ready(page);
  await openFirst(page);
  await expect(page.locator("#lbCaption")).toBeVisible();
  async function inBounds() {
    return page.locator("#lbFrame, #lbCaption, .lb-tools").evaluateAll((elements) => elements.every((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight + 1;
    }));
  }
  await expect.poll(inBounds).toBe(true);
  const source = await page.locator("#lbImg").evaluate((img) => img.currentSrc);
  await page.setViewportSize({ width: 844, height: 320 });
  await expect.poll(inBounds).toBe(true);
  expect(await page.locator("#lbImg").evaluate((img) => img.currentSrc)).toBe(source);
});
