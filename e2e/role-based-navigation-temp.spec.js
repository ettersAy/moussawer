import { test, expect } from '@playwright/test'

// Test data constants
const TEST_USERS = {
    admin: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        role: 'admin',
        dashboardPath: '/admin/dashboard',
    },
    photographer: {
        email: 'photographer@example.com',
        password: 'PhotographerPassword123!',
        role: 'photographer',
        dashboardPath: '/photographer/dashboard',
    },
    client: {
        email: 'client@example.com',
        password: 'ClientPassword123!',
        role: 'client',
        dashboardPath: '/client/dashboard',
    },
}

const PHOTOGRAPHER_USER = {
    id: 1,
    name: 'Test Photographer',
    email: 'test@moussawer.test',
    role: 'photographer',
}

const CLIENT_USER = {
    id: 2,
    name: 'Test Client',
    email: 'client@moussawer.test',
    role: 'client',
}

/**
 * Helper functions for common test operations
 */
const authHelpers = {
    /**
     * Set up authenticated session in localStorage
     */
    async setupAuthenticatedSession(page, userData) {
        await page.goto('/login')
        await page.evaluate((data) => {
            localStorage.setItem('auth_token', 'test-token-123')
            localStorage.setItem('auth_user', JSON.stringify(data))
        }, userData)
    },

    /**
     * Mock API responses to prevent authentication redirects
     */
    async mockApiResponses(page, userData) {
        await page.route('**/api/user', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user: userData })
            })
        })
        await page.route('**/api/bookings', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: [] })
            })
        })
    },

    /**
     * Clear authentication data
     */
    async clearAuthData(page) {
        await page.evaluate(() => {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
        })
    },

    /**
     * Verify authentication data is cleared
     */
    async verifyAuthCleared(page) {
        const token = await page.evaluate(() => localStorage.getItem('auth_token'))
        const user = await page.evaluate(() => localStorage.getItem('auth_user'))
        expect(token).toBeNull()
        expect(user).toBeNull()
    }
}

/**
 * Navigation helpers
 */
const navigationHelpers = {
    /**
     * Navigate to a URL and wait for network idle
     */
    async navigateTo(page, url) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
    },

    /**
     * Verify URL matches pattern
     */
    async verifyUrl(page, pattern) {
        await expect(page).toHaveURL(pattern)
    },

    /**
     * Click a link by role and name pattern
     */
    async clickLink(page, namePattern) {
        await page.getByRole('link', { name: namePattern }).first().click()
    },

    /**
     * Verify link is visible
     */
    async verifyLinkVisible(page, namePattern) {
        await expect(page.getByRole('link', { name: namePattern }).first()).toBeVisible()
    }
}

/**
 * Test suite for login redirects
 */
test.describe('Login redirects based on user role', () => {
    for (const [role, user] of Object.entries(TEST_USERS)) {
        test(`${role} user is redirected to their dashboard after login`, async ({ page }) => {
            await navigationHelpers.navigateTo(page, '/login')
            await navigationHelpers.verifyUrl(page, /\/login/)

            await page.fill('input[name="email"]', user.email)
            await page.fill('input[name="password"]', user.password)
            await page.click('button[type="submit"]')

            await expect(page).toHaveURL(new RegExp(user.dashboardPath), { timeout: 10000 })
            await navigationHelpers.verifyUrl(page, /\/dashboard/)
        })
    }
})

/**
 * Test suite for navigation menu visibility
 */
test.describe('Navigation menu shows correct role-specific links', () => {
    test('Photographer navigation includes photographer-specific links', async ({ page }) => {
        await navigationHelpers.navigateTo(page, '/photographer/dashboard')
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123')
            localStorage.setItem('auth_user', JSON.stringify(userData))
        }, PHOTOGRAPHER_USER)

        await page.reload()
        await page.waitForLoadState('networkidle')

        await navigationHelpers.verifyLinkVisible(page, /dashboard/i)
        await navigationHelpers.verifyLinkVisible(page, /bookings/i)
        await navigationHelpers.verifyLinkVisible(page, /profile/i)
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()
    })

    test('Client navigation includes client-specific links', async ({ page }) => {
        await navigationHelpers.navigateTo(page, '/client/dashboard')
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123')
            localStorage.setItem('auth_user', JSON.stringify(userData))
        }, CLIENT_USER)

        await page.reload()
        await page.waitForLoadState('networkidle')

        await navigationHelpers.verifyLinkVisible(page, /dashboard/i)
        await navigationHelpers.verifyLinkVisible(page, /my bookings/i)
        await navigationHelpers.verifyLinkVisible(page, /my profile/i)
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()
    })
})

/**
 * Test suite for internal navigation within dashboards
 */
test.describe('Internal navigation within role dashboards', () => {
    test('Photographer can navigate between dashboard sections', async ({ page }) => {
        await authHelpers.mockApiResponses(page, PHOTOGRAPHER_USER)
        await authHelpers.setupAuthenticatedSession(page, PHOTOGRAPHER_USER)

        await navigationHelpers.navigateTo(page, '/photographer/dashboard')
        await navigationHelpers.verifyUrl(page, /\/photographer\/dashboard/)
        await navigationHelpers.verifyLinkVisible(page, /profile/i)

        await navigationHelpers.navigateTo(page, '/photographer/bookings')
        await navigationHelpers.verifyUrl(page, /\/photographer\/bookings/)
        await navigationHelpers.verifyLinkVisible(page, /profile/i)

        await navigationHelpers.clickLink(page, /profile/i)
        await navigationHelpers.verifyUrl(page, /\/photographer\/profile/)

        await navigationHelpers.clickLink(page, /dashboard/i)
        await navigationHelpers.verifyUrl(page, /\/photographer\/dashboard/)
    })

    test('Client can navigate between dashboard sections', async ({ page }) => {

        await authHelpers.mockApiResponses(page, CLIENT_USER)
        await authHelpers.setupAuthenticatedSession(page, CLIENT_USER)

        await navigationHelpers.navigateTo(page, '/client/dashboard')
        await navigationHelpers.verifyUrl(page, /\/client\/dashboard/)
        await navigationHelpers.verifyLinkVisible(page, /profile/i)

        await navigationHelpers.clickLink(page, /my bookings/i)
        await navigationHelpers.verifyUrl(page, /\/client\/bookings/)

        await navigationHelpers.clickLink(page, /my profile/i)
        await navigationHelpers.verifyUrl(page, /\/client\/profile/)

        await navigationHelpers.clickLink(page, /dashboard/i)
        await navigationHelpers.verifyUrl(page, /\/client\/dashboard/)
    })
})

/**
 * Test suite for authentication guards
 */
test.describe('Authentication guards', () => {
    test('Logout clears session and redirects to login', async ({ page }) => {
        await navigationHelpers.navigateTo(page, '/client/dashboard')
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123')
            localStorage.setItem('auth_user', JSON.stringify(userData))
        }, CLIENT_USER)

        await page.reload()
        await page.waitForLoadState('networkidle')
        await navigationHelpers.verifyUrl(page, /\/client\/dashboard/)

        await page.getByRole('button', { name: /logout/i }).click()
        await navigationHelpers.verifyUrl(page, /\/login/)
        await authHelpers.verifyAuthCleared(page)
    })

    test('Authenticated users are redirected from login page', async ({ page }) => {
        await navigationHelpers.navigateTo(page, '/login')
        
        await page.evaluate((userData) => {
            localStorage.setItem('auth_token', 'test-token-123')
            localStorage.setItem('auth_user', JSON.stringify(userData))
        }, CLIENT_USER)

        await page.reload()
        await page.waitForLoadState('networkidle')
        await navigationHelpers.verifyUrl(page, /\/client\/dashboard/)
    })

    test('Unauthenticated users accessing protected routes are redirected to login', async ({ page }) => {
        await navigationHelpers.navigateTo(page, '/')
        await authHelpers.clearAuthData(page)

        await navigationHelpers.navigateTo(page, '/photographer/dashboard')
        await navigationHelpers.verifyUrl(page, /\/login/)
    })
})

/**
 * Test suite for role-based access control
 */
test.describe('Role-based access control', () => {
    test('Photographer cannot access client routes', async ({ page }) => {
        await authHelpers.mockApiResponses(page, PHOTOGRAPHER_USER)
        await authHelpers.setupAuthenticatedSession(page, PHOTOGRAPHER_USER)

        await navigationHelpers.navigateTo(page, '/photographer/dashboard')
        await navigationHelpers.verifyUrl(page, /\/photographer\/dashboard/)

        await navigationHelpers.navigateTo(page, '/client/dashboard')
        await page.waitForLoadState('networkidle')

        // Should be redirected to photographer dashboard (role-based redirect)
        const url = page.url()
        const hasAccess = url.includes('/client/dashboard')
        expect(hasAccess).toBe(false)
        // Verify we're still on photographer dashboard or redirected appropriately
        expect(url).toMatch(/\/photographer\/dashboard|\/login/)
    })

    test('Client cannot access photographer routes', async ({ page }) => {
        await authHelpers.mockApiResponses(page, CLIENT_USER)
        await authHelpers.setupAuthenticatedSession(page, CLIENT_USER)

        await navigationHelpers.navigateTo(page, '/client/dashboard')
        await navigationHelpers.verifyUrl(page, /\/client\/dashboard/)

        await navigationHelpers.navigateTo(page, '/photographer/dashboard')
        await page.waitForLoadState('networkidle')

        // Should be redirected to client dashboard (role-based redirect)
        const url = page.url()
        const hasAccess = url.includes('/photographer/dashboard')
        expect(hasAccess).toBe(false)
        // Verify we're still on client dashboard or redirected appropriately
        expect(url).toMatch(/\/client\/dashboard|\/login/)
    })
})
