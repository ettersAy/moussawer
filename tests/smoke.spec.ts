import { test, expect, CREDENTIALS } from "../fixtures/auth.fixture";
import { LoginPage } from "../pages/login.page";

/**
 * Smoke test — broad end-to-end coverage of critical paths.
 *
 * Covers:
 *   - Homepage loads with correct branding & navigation
 *   - Unauthenticated users are redirected to /login for protected routes
 *   - Client login, role-based navigation visibility, role-based redirect
 *   - Logout flow
 *   - Admin login, admin nav visibility, admin page access
 *
 * Replaces the legacy tests/smoke-test.js with @playwright/test best practices:
 *   - No waitForTimeout() calls
 *   - No page.evaluate() for auth
 *   - All assertions use Playwright's web-first expect
 */

test.describe("Smoke", { tag: ["@smoke"] }, () => {
  // ── Homepage ─────────────────────────────────────────────────────────
  test("homepage loads with branding and public nav", async ({ page }) => {
    await test.step("navigate to homepage", async () => {
      await page.goto("/");
    });

    await test.step("verify page title", async () => {
      await expect(page).toHaveTitle("Moussawer");
    });

    await test.step("verify brand and public nav links", async () => {
      await expect(page.getByText("Moussawer").first()).toBeVisible();
      await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /join/i })).toBeVisible();
    });
  });

  // ── Unauthenticated redirect ──────────────────────────────────────────
  test("unauthenticated users are redirected to /login for protected routes", async ({ page }) => {
    const protectedPaths = ["/dashboard", "/messages", "/admin"];

    for (const path of protectedPaths) {
      await test.step(`navigate to ${path} without auth`, async () => {
        await page.goto(path);
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
      });
    }
  });

  // ── Client login & nav ────────────────────────────────────────────────
  test("client can log in and sees role-appropriate navigation", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("log in as client", async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.client.email, CREDENTIALS.client.password);
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    });

    await test.step("verify client navigation", async () => {
      await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /messages/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /cases/i })).toBeVisible();
      // Admin nav should NOT be visible for clients
      await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
      await expect(page.getByText("Sign out")).toBeVisible();
      // Public links should NOT be visible when logged in
      await expect(page.getByRole("link", { name: /log in/i })).toHaveCount(0);
    });
  });

  // ── Client role-based redirect ────────────────────────────────────────
  test("client is redirected from /admin to /dashboard", async ({ clientPage }) => {
    await test.step("navigate to /admin as client", async () => {
      await clientPage.goto("/admin");
    });

    await test.step("verify redirect to dashboard", async () => {
      await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────
  test("user can log out and returns to public state", async ({ clientPage }) => {
    await test.step("click sign out", async () => {
      await clientPage.getByRole("button", { name: /sign out/i }).click();
    });

    await test.step("verify logged out state", async () => {
      await expect(clientPage).not.toHaveURL(/\/dashboard/, { timeout: 10_000 });
      await expect(clientPage.getByRole("link", { name: /log in/i })).toBeVisible();
    });
  });

  // ── Admin login & nav ─────────────────────────────────────────────────
  test("admin can log in and sees admin navigation", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("log in as admin", async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    });

    await test.step("verify admin nav is visible", async () => {
      await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
    });
  });

  // ── Admin page access ─────────────────────────────────────────────────
  test("admin can access /admin page", async ({ adminPage }) => {
    await test.step("navigate to /admin via nav link", async () => {
      await adminPage.getByRole("link", { name: "Admin" }).click();
    });

    await test.step("verify on admin page and content rendered", async () => {
      await expect(adminPage).toHaveURL(/\/admin/, { timeout: 10_000 });
      await expect(adminPage.getByText("Moussawer").first()).toBeVisible();
    });
  });
});
