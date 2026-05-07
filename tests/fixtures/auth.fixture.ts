import { test as base, type Page } from "@playwright/test";

/**
 * Test credentials — sourced from environment variables with fallback defaults.
 *
 * Override via .env.test or CI environment:
 *   TEST_ADMIN_EMAIL, TEST_CLIENT_EMAIL, TEST_PHOTOGRAPHER_EMAIL, TEST_PASSWORD
 */
export const CREDENTIALS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || "admin@example.com",
    password: process.env.TEST_PASSWORD || "password",
  },
  client: {
    email: process.env.TEST_CLIENT_EMAIL || "client@example.com",
    password: process.env.TEST_PASSWORD || "password",
  },
  photographer: {
    email: process.env.TEST_PHOTOGRAPHER_EMAIL || "photographer-one@example.com",
    password: process.env.TEST_PASSWORD || "password",
  },
} as const;

/**
 * Authenticate via the API (Playwright request fixture compatible) and set the
 * token in localStorage so the SPA treats the user as logged in.
 */
async function authenticateViaApi(page: Page, email: string, password: string) {
  // Use Playwright's built-in API request (via page.request)
  const res = await page.request.post("/api/v1/auth/login", {
    data: { email, password },
  });

  if (!res.ok()) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Auth fixture login failed for ${email}: ${body?.error?.message || res.statusText()}`);
  }

  const { data } = await res.json();
  const token: string = data.token;

  // Set token in localStorage so the SPA picks it up on next navigation
  await page.evaluate((t) => localStorage.setItem("moussawer_token", t), token);
}

/**
 * Extended test fixtures providing pre-authenticated pages for each role.
 *
 * Usage:
 *   import { test } from "../fixtures/auth.fixture";
 *   test("admin can access dashboard", async ({ adminPage }) => { ... });
 */
export type AuthFixtures = {
  /** Page pre-authenticated as admin@example.com */
  adminPage: Page;
  /** Page pre-authenticated as client@example.com */
  clientPage: Page;
  /** Page pre-authenticated as photographer-one@example.com */
  photographerPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ page }, use) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await authenticateViaApi(page, CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/);
    await use(page);
  },

  clientPage: async ({ page }, use) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await authenticateViaApi(page, CREDENTIALS.client.email, CREDENTIALS.client.password);
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/);
    await use(page);
  },

  photographerPage: async ({ page }, use) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await authenticateViaApi(page, CREDENTIALS.photographer.email, CREDENTIALS.photographer.password);
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/);
    await use(page);
  },
});

export { expect } from "@playwright/test";
