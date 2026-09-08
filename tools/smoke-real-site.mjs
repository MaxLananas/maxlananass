import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { staticServer } from "./serve.mjs";

const report = JSON.parse(await readFile(".cache/build-report.json", "utf8"));
assert.equal(report.source, "github-release", "Do not pass fixtures off as a real browser validation");
const server = staticServer("dist");
await new Promise(resolve => server.listen(0, "0.0.0.0", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, serviceWorkers: "block" });
  const errors = [], externalImages = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.resourceType() === "image" && !request.url().startsWith(origin) && !request.url().startsWith("data:")) externalImages.push(request.url()); });
  await page.addInitScript(() => {
    window.__shifts = [];
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shifts.push(entry.value); }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(origin, { waitUntil: "load" });
  await page.locator(".tile img.loaded").first().waitFor({ timeout: 20000 });
  const state = await page.evaluate(() => ({ tiles: document.querySelectorAll(".tile").length, loaded: document.querySelectorAll(".tile img.loaded").length,
    cls: window.__shifts.reduce((sum, value) => sum + value, 0), overflow: document.documentElement.scrollWidth > innerWidth }));
  assert.equal(state.tiles, 101);
  assert.ok(state.loaded > 0 && state.loaded < 45, "Only the nearby real images should load");
  assert.ok(state.cls < .02, `Unexpected layout shift: ${state.cls}`);
  assert.equal(state.overflow, false);
  assert.deepEqual(externalImages, [], "Prepared gallery must not silently fall back to the external proxy");
  assert.deepEqual(errors, []);
  await page.screenshot({ path: ".cache/real-build-first-screen.png" });
  await writeFile(".cache/real-browser-validation.json", JSON.stringify({ source: "real GitHub release originals", scope: "Local Chromium on the CI runner; not field Core Web Vitals", ...state, errors, externalImages }, null, 2));
  console.log("Real-asset browser validation:", state);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
