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
  await expect(page.locator(".pv-caption")).toContainText("Public-facing page");
  await expect(page.locator(".pv-full-size")).toHaveAttribute("href", /iprof-showcase/);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.project-viewer")).not.toBeVisible();
  await expect(first).toBeFocused();
  expect(await page.locator("body").evaluate(el => el.style.overflow)).toBe("");
  expect(external).toEqual([]);
});

test("native video is deferred, plays and supports seeking without Google", async ({ page }) => {
  const remote = [], mediaRequests = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (/google|drive/.test(url.hostname)) remote.push(request.url());
    if (url.pathname.endsWith(".mp4")) mediaRequests.push(request.url());
  });
  await page.goto("/projects/iprof-redesign/");
  const video = page.locator("video.native-project-video");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.waitForTimeout(300);
  expect(mediaRequests).toEqual([]);
  await video.evaluate(async element => { element.muted = true; await element.play(); });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(.5);
  await video.evaluate(element => { element.pause(); element.currentTime = 30; });
  await expect.poll(() => video.evaluate(element => element.readyState)).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate(element => element.currentTime)).toBeCloseTo(30, 0);
  expect(mediaRequests.length).toBeGreaterThan(0);
  expect(remote).toEqual([]);
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
    await expect(page.locator(".video-note a")).toHaveAttribute("href", /assets\/video\/.*\.mp4$/);
    await expect(page.locator("footer")).toContainText("Modrinth");
  } finally { await context.close(); }
});
