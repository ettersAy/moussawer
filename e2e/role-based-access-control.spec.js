import { test, expect } from './fixtures/index.js';
import { PHOTOGRAPHER_USER, CLIENT_USER } from './fixtures/test-data.js';
import { mockApiResponses, setupAuthenticatedSession } from './helpers/auth-helpers.js';
import { navigateTo, verifyUrl } from './helpers/navigation-helpers.js';

/**
 * Test suite for role-based access control
 */
test.describe('Role-based access control', () => {
    test('Photographer cannot access client routes', async ({ page }) => {
        await mockApiResponses(page, PHOTOGRAPHER_USER);
        await setupAuthenticatedSession(page, PHOTOGRAPHER_USER);

        await navigateTo(page, '/photographer/dashboard');
        await verifyUrl(page, /\/photographer\/dashboard/);

        await navigateTo(page, '/client/dashboard');
        await page.waitForLoadState('networkidle');

        // Should be redirected to photographer dashboard (role-based redirect)
        const url = page.url();
        const hasAccess = url.includes('/client/dashboard');
        expect(hasAccess).toBe(false);
        // Verify we're still on photographer dashboard or redirected appropriately
        expect(url).toMatch(/\/photographer\/dashboard|\/login/);
    });

    test('Client cannot access photographer routes', async ({ page }) => {
        await mockApiResponses(page, CLIENT_USER);
        await setupAuthenticatedSession(page, CLIENT_USER);

        await navigateTo(page, '/client/dashboard');
        await verifyUrl(page, /\/client\/dashboard/);

        await navigateTo(page, '/photographer/dashboard');
        await page.waitForLoadState('networkidle');

        // Should be redirected to client dashboard (role-based redirect)
        const url = page.url();
        const hasAccess = url.includes('/photographer/dashboard');
        expect(hasAccess).toBe(false);
        // Verify we're still on client dashboard or redirected appropriately
        expect(url).toMatch(/\/client\/dashboard|\/login/);
    });
});