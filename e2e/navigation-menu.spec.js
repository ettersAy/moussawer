import { test, expect } from './fixtures/index.js';
import { PHOTOGRAPHER_USER, CLIENT_USER } from './fixtures/test-data.js';
import { navigateTo, verifyLinkVisible } from './helpers/navigation-helpers.js';

/**
 * Test suite for navigation menu visibility
 */
test.describe('Navigation menu shows correct role-specific links', () => {
    test('Photographer navigation includes photographer-specific links', async ({ page }) => {
        await navigateTo(page, '/photographer/dashboard');
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123');
            localStorage.setItem('auth_user', JSON.stringify(userData));
        }, PHOTOGRAPHER_USER);

        await page.reload();
        await page.waitForLoadState('networkidle');

        await verifyLinkVisible(page, /dashboard/i);
        await verifyLinkVisible(page, /bookings/i);
        await verifyLinkVisible(page, /profile/i);
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });

    test('Client navigation includes client-specific links', async ({ page }) => {
        await navigateTo(page, '/client/dashboard');
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123');
            localStorage.setItem('auth_user', JSON.stringify(userData));
        }, CLIENT_USER);

        await page.reload();
        await page.waitForLoadState('networkidle');

        await verifyLinkVisible(page, /dashboard/i);
        await verifyLinkVisible(page, /my bookings/i);
        await verifyLinkVisible(page, /my profile/i);
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });
});