import { expect } from '@playwright/test';

/**
 * Helper functions for authentication operations in tests
 */

/**
 * Set up authenticated session in localStorage
 */
export async function setupAuthenticatedSession(page, userData) {
    await page.goto('/login');
    await page.evaluate((data) => {
        localStorage.setItem('auth_token', 'test-token-123');
        localStorage.setItem('auth_user', JSON.stringify(data));
    }, userData);
}

/**
 * Mock API responses to prevent authentication redirects
 */
export async function mockApiResponses(page, userData) {
    await page.route('**/api/user', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user: userData }),
        });
    });
    await page.route('**/api/bookings', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: [] }),
        });
    });
}

/**
 * Clear authentication data
 */
export async function clearAuthData(page) {
    await page.evaluate(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    });
}

/**
 * Verify authentication data is cleared
 */
export async function verifyAuthCleared(page) {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const user = await page.evaluate(() => localStorage.getItem('auth_user'));
    expect(token).toBeNull();
    expect(user).toBeNull();
}
