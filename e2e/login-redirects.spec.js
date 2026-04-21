import { test, expect } from './fixtures/index.js';
import { TEST_USERS } from './fixtures/test-data.js';
import { navigateTo, verifyUrl } from './helpers/navigation-helpers.js';

/**
 * Test suite for login redirects
 */
test.describe('Login redirects based on user role', () => {
    for (const [role, user] of Object.entries(TEST_USERS)) {
        test(`${role} user is redirected to their dashboard after login`, async ({ loginPage, page }) => {
            // Mock the login API endpoint to return success
            await page.route('**/api/login', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        token: 'test-token-123',
                        user: {
                            id: 1,
                            name: `Test ${role}`,
                            email: user.email,
                            role: role,
                        }
                    }),
                });
            });

            // Mock the /api/user endpoint that will be called after login
            await page.route('**/api/user', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        user: {
                            id: 1,
                            name: `Test ${role}`,
                            email: user.email,
                            role: role,
                        }
                    }),
                });
            });

            await loginPage.goto();
            await verifyUrl(page, /\/login/);

            await loginPage.login({
                email: user.email,
                password: user.password,
            });

            await expect(page).toHaveURL(new RegExp(user.dashboardPath), { timeout: 10000 });
            await verifyUrl(page, /\/dashboard/);
        });
    }
});
