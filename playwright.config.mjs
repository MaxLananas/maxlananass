import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const launchOptions = executablePath ? {
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader"]
} : {};

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  timeout: 25000,
  expect: { timeout: 8000 },
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4174",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", launchOptions } },
    ...(!executablePath ? [
      { name: "desktop-firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } } },
      { name: "mobile-webkit", use: { ...devices["iPhone 13"] } }
    ] : [])
  ],
  webServer: [
    { command: "node tools/serve.mjs --root .cache/test-site --port 4174", url: "http://127.0.0.1:4174", reuseExistingServer: !process.env.CI },
    { command: "node tools/serve.mjs --root .cache/source-site --port 4175", url: "http://127.0.0.1:4175", reuseExistingServer: !process.env.CI }
  ]
});
