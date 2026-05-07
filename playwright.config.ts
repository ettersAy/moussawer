import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  outputDir: "./test-results",

  /* Auto-start the dev server before tests and shut it down after */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    cwd: ".",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Mobile viewport — uncomment to enable:
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    */
  ],
});
