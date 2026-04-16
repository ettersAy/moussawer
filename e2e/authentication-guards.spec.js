import { test, expect } from './fixtures/index.js';
import { CLIENT_USER } from './fixtures/test-data.js';
import { clearAuthData, verifyAuthCleared } from './helpers/auth-helpers.js';
import { navigateTo, verifyUrl } from './helpers/navigation-helpers.js';

/**
 * Test suite for authentication guards
 */
test.describe('Authentication guards', () => {
    test('Logout clears session and redirects to login', async ({ page }) => {
        await navigateTo(page, '/client/dashboard');
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123');
            localStorage.setItem('auth_user', JSON.stringify(userData));
        }, CLIENT_USER);

        await page.reload();
        await page.waitForLoadState('networkidle');
        await verifyUrl(page, /\/client\/dashboard/);

        await page.getByRole('button', { name: /logout/i }).click();
        await verifyUrl(page, /\/login/);
        await verifyAuthCleared(page);
    });

    test('Authenticated users are redirected from login page', async ({ page }) => {
        await navigateTo(page, '/login');
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123');
            localStorage.setItem('auth_user', JSON.stringify(userData));
        }, CLIENT_USER);

        await page.reload();
        await page.waitForLoadState('networkidle');
        await verifyUrl(page, /\/client\/dashboard/);
    });

    test('Unauthenticated users accessing protected routes are redirected to login', async ({ page }) => {
        await navigateTo(page, '/');
        await clearAuthData(page);

        await navigateTo(page, '/photographer/dashboard');
        await verifyUrl(page, /\/login/);
    });
});