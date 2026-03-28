import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory where all E2E tests live
  testDir: './e2e',

  // Fail the build if any tests are accidentally left in .only mode
  forbidOnly: !!process.env.CI,

  // Retry failed tests once in CI for resilience against flakiness
  retries: process.env.CI ? 1 : 0,

  // Run tests in parallel in CI, sequentially locally for easier debugging
  workers: process.env.CI ? '50%' : 1,

  // Reporter: use HTML report always; add GitHub annotations in CI
  reporter: [
    ['html', { outputFolder: 'e2e/reports/html', open: 'never' }],
    ...(process.env.CI ? [['github']] : [['list']]),
  ],

  // Base URL for all page.goto('/path') calls.
  // This project uses Sail with APP_PORT not set, so it binds to port 80.
  // → http://localhost (port 80, the default) is correct.
  // If you ever set APP_PORT=8000 in your .env, change this to http://localhost:8000
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Run only Chromium in dev; add Firefox and WebKit for full CI runs
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(process.env.CI
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
});
