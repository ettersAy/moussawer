import { test, expect, CREDENTIALS } from "./fixtures/auth.fixture";
import { LoginPage } from "./pages/login.page";

/**
 * Admin Login Playwright E2E Tests
 *
 * Prerequisites:
 *   1. Server running on port 4000 (auto-started by Playwright webServer config)
 *   2. Database seeded with admin@example.com, client@example.com / password
 *
 * Run:
 *   npx playwright test tests/admin-login.spec.ts
 *
 * Tags: @auth @admin @smoke
 */

test.describe("Admin Login", { tag: ["@auth", "@admin", "@smoke"] }, () => {
  test("login page renders correctly", { tag: ["@smoke"] }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("navigate to login page", async () => {
      await loginPage.goto();
    });

    await test.step("verify login form elements are visible", async () => {
      await expect(loginPage.heading()).toBeVisible();
      await expect(loginPage.emailInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
      await expect(loginPage.submitButton()).toBeVisible();
    });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("attempt login with wrong credentials", async () => {
      await loginPage.goto();
      await loginPage.login("wrong@example.com", "wrongpassword");
    });

    await test.step("verify error message is displayed", async () => {
      await loginPage.expectErrorVisible();
    });
  });

  test("admin can log in via UI and land on dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("log in as admin via UI", async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);
    });

    await test.step("verify redirect to dashboard", async () => {
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    });

    await test.step("verify admin greeting and nav", async () => {
      await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/moussawer admin/i)).toBeVisible();
      await expect(page.getByRole("link", { name: "Admin" })).toBeVisible({ timeout: 5_000 });
      await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
    });
  });

  test("admin can access /admin page after login", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("log in as admin", async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    });

    await test.step("navigate to admin panel", async () => {
      await page.getByRole("link", { name: "Admin" }).click();
      await page.waitForURL(/\/admin/, { timeout: 10_000 });
    });

    await test.step("verify admin panel rendered", async () => {
      await expect(page.getByText(/manage your platform/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole("button", { name: /overview/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /users/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /incidents/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /disputes/i })).toBeVisible();
    });
  });

  test("admin can log out", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("log in as admin", async () => {
      await loginPage.goto();
      await loginPage.login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    });

    await test.step("sign out", async () => {
      await page.getByRole("button", { name: /sign out/i }).click();
    });

    await test.step("verify logged out state", async () => {
      await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 10_000 });
      await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
    });
  });

  test("non-admin user cannot access /admin page", async ({ clientPage }) => {
    await test.step("verify admin nav is not visible for client", async () => {
      await expect(clientPage.getByRole("link", { name: "Admin" })).toHaveCount(0);
    });

    await test.step("attempt to navigate to /admin directly", async () => {
      await clientPage.goto("/admin");
    });

    await test.step("verify redirect away from /admin", async () => {
      await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    });
  });
});
