import { test, expect } from './fixtures/index.js';
import { PHOTOGRAPHER_USER, CLIENT_USER } from './fixtures/test-data.js';
import { mockApiResponses, setupAuthenticatedSession } from './helpers/auth-helpers.js';
import { navigateTo, verifyUrl, clickLink, verifyLinkVisible } from './helpers/navigation-helpers.js';

/**
 * Test suite for internal navigation within dashboards
 */
test.describe('Internal navigation within role dashboards', () => {
    test('Photographer can navigate between dashboard sections', async ({ page }) => {
        await mockApiResponses(page, PHOTOGRAPHER_USER);
        await setupAuthenticatedSession(page, PHOTOGRAPHER_USER);

        await navigateTo(page, '/photographer/dashboard');
        await verifyUrl(page, /\/photographer\/dashboard/);
        await verifyLinkVisible(page, /profile/i);

        await navigateTo(page, '/photographer/bookings');
        await verifyUrl(page, /\/photographer\/bookings/);
        await verifyLinkVisible(page, /profile/i);

        await clickLink(page, /profile/i);
        await verifyUrl(page, /\/photographer\/profile/);

        await clickLink(page, /dashboard/i);
        await verifyUrl(page, /\/photographer\/dashboard/);
    });

    test('Client can navigate between dashboard sections', async ({ page }) => {
        await mockApiResponses(page, CLIENT_USER);
        await setupAuthenticatedSession(page, CLIENT_USER);

        await navigateTo(page, '/client/dashboard');
        await verifyUrl(page, /\/client\/dashboard/);
        await verifyLinkVisible(page, /profile/i);

        await clickLink(page, /my bookings/i);
        await verifyUrl(page, /\/client\/bookings/);

        await clickLink(page, /my profile/i);
        await verifyUrl(page, /\/client\/profile/);

        await clickLink(page, /dashboard/i);
        await verifyUrl(page, /\/client\/dashboard/);
    });
});