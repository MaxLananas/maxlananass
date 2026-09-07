import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { sitePages } from "../../content/pages.js";
import { checkSeo } from "../../tools/seo-check.mjs";

const pages = sitePages();

test("the compiled deployment passes the same static SEO crawl as the source", async () => {
  const report = await checkSeo({ directory: ".cache/test-site", snapshots: false });
  expect(report.indexable).toBe(22);
  expect(report.originalScreenshots).toBe(101);
  expect(report.orphans).toBe(0);
});

test("every document page has usable content and navigation without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    for (const route of ["/about/", "/fr/a-propos/", "/buildtheearth/", "/development/", "/projects/homegui/", "/guides/minecraft-mods-plugins-addons/"]) {
      const response = await page.goto("http://127.0.0.1:4174" + route);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(pages.find((item) => item.path === route).heading);
      await expect(page.locator("main")).toContainText("MaxLananas");
      expect(await page.locator("main a[href]").count()).toBeGreaterThan(5);
    }
    await page.goto("http://127.0.0.1:4174/builds/");
    await expect(page.locator(".photo-card")).toHaveCount(16);
    await page.locator('.pagination a[rel="next"]').first().click();
    await expect(page).toHaveURL(/\/builds\/page\/2\/$/);
    await expect(page.locator(".photo-card")).toHaveCount(16);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://maxlananas.is-a.dev/builds/page/2/");
    await page.goto("http://127.0.0.1:4174/builds/page/7/");
    await expect(page.locator(".photo-card")).toHaveCount(5);
  } finally { await context.close(); }
});

test("the French profile identifies the same person and has reciprocal language links", async ({ page }) => {
  await page.goto("/about/");
  await page.locator(".language-nav a[lang=fr]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("h1")).toHaveText("À propos de MaxLananas");
  const entity = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(entity)["@graph"].find((node) => node["@type"] === "Person")["@id"]).toBe("https://maxlananas.is-a.dev/#person");
  await page.locator(".language-nav a[lang=en]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("search is noindex and uses the right root assets from a nested URL", async ({ page }) => {
  const bad = [];
  page.on("response", (response) => { if (response.status() >= 400 && response.url().startsWith("http://127.0.0.1:4174")) bad.push(response.url()); });
  await page.goto("/search/?q=pot%20de%20fleur");
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", /noindex/);
  await expect(page.locator("link[rel=canonical]")).toHaveCount(0);
  await expect(page.locator(".tile:not([hidden])")).toHaveCount(1);
  await expect(page.locator(".tile img.loaded")).toHaveCount(1);
  await page.locator(".tile:not([hidden])").click();
  await expect(page.locator("#lbImg")).toHaveClass(/loaded/);
  expect(bad).toEqual([]);
});

test("mobile and narrow screens retain all content without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  for (const route of ["/", "/about/", "/projects/", "/projects/railway-tools-axiom/", "/guides/minecraft-mods-plugins-addons/", "/builds/page/7/"]) {
    await page.goto(route);
    await page.locator("h1").waitFor();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
  }
});

for (const route of ["/", "/about/", "/projects/homegui/", "/guides/minecraft-mods-plugins-addons/", "/builds/page/7/"]) {
  test(`WCAG checks for ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator("h1").waitFor();
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test.describe("document page offline navigation", () => {
  test.use({ serviceWorkers: "allow" });
  test("a previously visited project keeps its content and canonical offline", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Service-worker lifecycle is covered on Chromium and by strategy unit tests");
    await page.goto("/projects/homegui/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.reload();
    await expect(page.locator("h1")).toHaveText("HomeGUI");
    await page.goto("/about/");
    await context.setOffline(true);
    await page.goto("/projects/homegui/");
    await expect(page.locator("h1")).toHaveText("HomeGUI");
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://maxlananas.is-a.dev/projects/homegui/");
    const missing = await page.goto("/this-page-does-not-exist/");
    expect(missing.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("404");
  });
});
