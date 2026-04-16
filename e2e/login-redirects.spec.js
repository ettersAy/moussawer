import { test, expect } from './fixtures/index.js';
import { TEST_USERS } from './fixtures/test-data.js';
import { navigateTo, verifyUrl } from './helpers/navigation-helpers.js';

/**
 * Test suite for login redirects
 */
test.describe('Login redirects based on user role', () => {
    for (const [role, user] of Object.entries(TEST_USERS)) {
        test(`${role} user is redirected to their dashboard after login`, async ({ loginPage, page }) => {
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
