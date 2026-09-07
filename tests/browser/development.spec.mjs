import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("development leads with iProf and uses Modrinth for published projects", async ({ page }) => {
  await page.goto("/development/");
  await expect(page.locator(".dev-spotlight h2")).toHaveText("iProf 2026");
  await expect(page.locator("#minecraft-releases .project-card")).toHaveCount(10);
  await expect(page.locator("#software-lab")).toContainText("SENTINEL");
  await expect(page.locator("#software-lab")).toContainText("MaxOS");
  await expect(page.locator("#software-lab")).toContainText("PineappleUI");
  await expect(page.locator("footer a[href='https://modrinth.com/user/maxlananass']")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("iProf screenshots stay local, open accessibly and survive rapid navigation", async ({ page }) => {
  const external = [];
  page.on("request", request => { if (/drive\.google|googleusercontent|modrinth/.test(new URL(request.url()).hostname)) external.push(request.url()); });
  await page.goto("/projects/iprof-redesign/");
  await expect(page.locator(".project-gallery-item")).toHaveCount(11);
  await expect(page.locator("iframe")).toHaveCount(0);
  const first = page.locator("a[data-project-viewer]").first();
  await first.click();
  await expect(page.locator("dialog.project-viewer")).toBeVisible();
  await expect(page.locator(".pv-count")).toHaveText("1 / 11");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".pv-count")).toHaveText("3 / 11");
  await expect(page.locator(".pv-caption")).toContainText("Interface showcase");
  await expect(page.locator(".pv-full-size")).toHaveAttribute("href", /iprof-showcase/);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.project-viewer")).not.toBeVisible();
  await expect(first).toBeFocused();
  expect(await page.locator("body").evaluate(el => el.style.overflow)).toBe("");
  expect(external).toEqual([]);
});

test("the video player loads only after explicit action, with an original link as fallback", async ({ page }) => {
  await page.route("https://drive.google.com/file/d/**/preview", route => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Test player</title><p>Player loaded</p>" }));
  await page.goto("/projects/iprof-redesign/");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("a[href='https://drive.google.com/file/d/1ZHfabuvXI7Y1_HHELVGH7kaGofM8QwWj/view']")).toBeVisible();
  await page.locator("[data-load-video]").click();
  await expect(page.locator(".video-facade iframe")).toHaveAttribute("src", "https://drive.google.com/file/d/1ZHfabuvXI7Y1_HHELVGH7kaGofM8QwWj/preview");
  await expect(page.locator(".video-facade iframe")).toHaveAttribute("title", /iProf/);
});

for (const route of ["/development/", "/projects/iprof-redesign/"]) test(`new development layout passes WCAG checks: ${route}`, async ({ page }) => {
  await page.goto(route);
  const report = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(report.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
});

test("iProf’s presentation and video link remain available without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4174/projects/iprof-redesign/");
    await expect(page.locator(".project-gallery-item")).toHaveCount(11);
    await expect(page.locator("a[data-project-viewer]").first()).toHaveAttribute("href", /\.webp$/);
    await expect(page.locator(".video-note a")).toHaveAttribute("href", /drive\.google\.com/);
    await expect(page.locator("footer")).toContainText("Modrinth");
  } finally { await context.close(); }
});
