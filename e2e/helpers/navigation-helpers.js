import { expect } from '@playwright/test';

/**
 * Helper functions for navigation operations in tests
 */

/**
 * Navigate to a URL (without waiting for network idle)
 */
export async function navigateTo(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
}

/**
 * Verify URL matches pattern
 */
export async function verifyUrl(page, pattern) {
    await expect(page).toHaveURL(pattern);
}

/**
 * Click a link by role and name pattern
 */
export async function clickLink(page, namePattern) {
    await page.getByRole('link', { name: namePattern }).first().click();
}

/**
 * Verify link is visible
 */
export async function verifyLinkVisible(page, namePattern) {
    await expect(page.getByRole('link', { name: namePattern }).first()).toBeVisible();
}
