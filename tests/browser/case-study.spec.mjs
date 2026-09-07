import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const token = "l9cboevgfOesdqe5S5lO7BqU_MB6XB1UIwmlr8EDCr0";

test("the iProf case study is fully linked in French and English", async ({ page }) => {
  await page.goto("/projects/iprof-redesign/");
  await page.locator(".language-nav a[lang=fr]").click();
  await expect(page).toHaveURL(/\/fr\/projets\/refonte-iprof\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("h1")).toHaveText("Refonte iProf 2026");
  await expect(page.locator(".case-study")).toContainText("La question de conception");
  await expect(page.locator(".project-gallery-item")).toHaveCount(11);
  await expect(page.locator("video source")).toHaveAttribute("src", /assets\/video\/.*\.mp4$/);
  const graph = JSON.parse(await page.locator("script[type='application/ld+json']").textContent())["@graph"];
  const article = graph.find(node => node["@type"] === "Article");
  expect(article.inLanguage).toBe("fr");
  expect(article.about["@id"]).toBe("https://maxlananas.is-a.dev/projects/iprof-redesign/#project");
  await page.locator(".language-nav a[lang=en]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Google verification is present exactly as requested on the public templates", async ({ page }) => {
  for (const route of ["/", "/projects/iprof-redesign/", "/fr/projets/refonte-iprof/"]) {
    await page.goto(route);
    await expect(page.locator("meta[name='google-site-verification']")).toHaveCount(1);
    await expect(page.locator("meta[name='google-site-verification']")).toHaveAttribute("content", token);
    await expect(page.locator("meta[name='portfolio-content-version']")).toHaveAttribute("content", /^[a-f0-9]{20}$/);
  }
});

test("brand motifs are decorative and the French study is accessible on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/fr/projets/refonte-iprof/");
  expect(await page.locator(".brand-icon").count()).toBeGreaterThan(3);
  expect(await page.locator(".brand-icon").evaluateAll(icons => icons.every(icon => icon.getAttribute("aria-hidden") === "true" && icon.getAttribute("focusable") === "false"))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
