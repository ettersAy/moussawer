import { expect } from '@playwright/test';

/**
 * Helper functions for navigation operations in tests
 */

/**
 * Navigate to a URL and wait for the Vue app to be ready
 */
export async function navigateTo(page, url) {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for the Vue app to be ready - look for common elements
    await page.waitForLoadState('networkidle');
    
    // Wait for either photographer or client layout to be visible
    await Promise.race([
        page.locator('.photographer-layout').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
        page.locator('.client-layout').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
        page.locator('.admin-layout').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
        page.locator('nav').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
    ]);
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
    console.log(`Attempting to click link matching pattern: ${namePattern}`);
    
    // First try to find by role='link'
    const linkByRole = page.getByRole('link', { name: namePattern });
    const countByRole = await linkByRole.count();
    console.log(`Found ${countByRole} links by role matching pattern: ${namePattern}`);
    
    if (countByRole > 0) {
        const link = linkByRole.first();
        await link.waitFor({ state: 'visible', timeout: 10000 });
        console.log(`Link is visible, clicking...`);
        await link.click();
        return;
    }
    
    // Fallback: try to find any <a> tag with matching text
    console.log('Trying fallback: searching all <a> tags...');
    const allLinks = await page.locator('a').all();
    for (const link of allLinks) {
        const text = await link.textContent();
        if (text && new RegExp(namePattern, 'i').test(text.trim())) {
            console.log(`Found fallback link with text: "${text}"`);
            await link.waitFor({ state: 'visible', timeout: 10000 });
            await link.click();
            return;
        }
    }
    
    // Last resort: try router-link components (Vue)
    console.log('Trying router-link components...');
    const routerLinks = await page.locator('router-link').all();
    for (const routerLink of routerLinks) {
        const text = await routerLink.textContent();
        if (text && new RegExp(namePattern, 'i').test(text.trim())) {
            console.log(`Found router-link with text: "${text}"`);
            // router-link might not be clickable directly, try to find the underlying <a>
            const parent = routerLink.locator('..');
            await parent.click();
            return;
        }
    }
    
    throw new Error(`No link found matching pattern: ${namePattern}`);
}

/**
 * Verify link is visible
 */
export async function verifyLinkVisible(page, namePattern) {
    console.log(`Verifying link visible matching pattern: ${namePattern}`);
    
    const linkByRole = page.getByRole('link', { name: namePattern });
    const countByRole = await linkByRole.count();
    console.log(`Found ${countByRole} links by role matching pattern: ${namePattern}`);
    
    if (countByRole > 0) {
        await expect(linkByRole.first()).toBeVisible();
        return;
    }
    
    // Fallback: try to find any <a> tag with matching text
    const allLinks = await page.locator('a').all();
    for (const link of allLinks) {
        const text = await link.textContent();
        if (text && new RegExp(namePattern, 'i').test(text.trim())) {
            console.log(`Found fallback link for verification with text: "${text}"`);
            await expect(link).toBeVisible();
            return;
        }
    }
    
    throw new Error(`No link found matching pattern: ${namePattern}`);
}
