import { test, expect } from '@playwright/test'

test.describe('Role-Based Navigation and Routing', () => {
    // Test users - these should be created via tinker commands in setup
    const testUsers = {
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

    /**
     * Setup commands (run once before tests):
     * Admin:     vendor/bin/sail artisan tinker --execute="App\Models\User::factory()->create(['role' => 'admin', 'email' => 'admin@example.com', 'password' => bcrypt('AdminPassword123!')])"
     * Photographer: vendor/bin/sail artisan tinker --execute="App\Models\User::factory()->create(['role' => 'photographer', 'email' => 'photographer@example.com', 'password' => bcrypt('PhotographerPassword123!')])"
     * Client:    vendor/bin/sail artisan tinker --execute="App\Models\User::factory()->create(['role' => 'client', 'email' => 'client@example.com', 'password' => bcrypt('ClientPassword123!')])"
     */

    test.describe('Login redirects based on user role', () => {
        for (const [role, user] of Object.entries(testUsers)) {
            test(`${role} user is redirected to their dashboard after login`, async ({ page }) => {
                // Go to login page and wait for it to load
                await page.goto('/login')
                await page.waitForLoadState('networkidle')

                // Verify we're on the login page
                await expect(page).toHaveURL(/\/login/)

                // Fill in login form
                await page.fill('input[name="email"]', user.email)
                await page.fill('input[name="password"]', user.password)

                // Submit login
                await page.click('button[type="submit"]')

                // Wait for redirect to role-specific dashboard
                await expect(page).toHaveURL(new RegExp(user.dashboardPath), {
                    timeout: 10000,
                })

                // Verify we're on the dashboard
                await expect(page).toHaveURL(/\/dashboard/)
            })
        }
    })

    test.describe('Navigation menu shows correct role-specific links', () => {
        test('Photographer navigation includes photographer-specific links', async ({ page }) => {
            // Navigate first to set the origin
            await page.goto('/photographer/dashboard')
            
            // Set up authenticated session for photographer
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 1,
                name: 'Test Photographer',
                email: 'test@moussawer.test',
                role: 'photographer',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')

            // Verify photographer-specific navigation items
            await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
            await expect(page.getByRole('link', { name: /bookings/i }).first()).toBeVisible()
            await expect(page.getByRole('link', { name: /profile/i }).first()).toBeVisible()
            await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()
        })

        test('Client navigation includes client-specific links', async ({ page }) => {
            // Navigate first to set the origin
            await page.goto('/client/dashboard')
            
            // Set up authenticated session for client
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 2,
                name: 'Test Client',
                email: 'client@moussawer.test',
                role: 'client',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')

            // Verify client-specific navigation items
            await expect(page.getByRole('link', { name: /dashboard/i }).first()).toBeVisible()
            await expect(page.getByRole('link', { name: /my bookings/i }).first()).toBeVisible()
            await expect(page.getByRole('link', { name: /my profile/i }).first()).toBeVisible()
            await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()
        })
    })

    test.describe('Internal navigation within role dashboards', () => {
        test('Photographer can navigate between dashboard sections', async ({ page }) => {
            // Navigate first to set the origin
            await page.goto('/photographer/dashboard')
            
            // Set up authenticated session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 1,
                name: 'Test Photographer',
                email: 'test@moussawer.test',
                role: 'photographer',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/photographer\/dashboard/)

            // Navigate to Bookings
            await page.getByRole('link', { name: /bookings/i }).first().click()
            await expect(page).toHaveURL(/\/photographer\/bookings/)

            // Navigate to Profile
            await page.getByRole('link', { name: /profile/i }).first().click()
            await expect(page).toHaveURL(/\/photographer\/profile/)

            // Navigate back to Dashboard
            await page.getByRole('link', { name: /dashboard/i }).first().click()
            await expect(page).toHaveURL(/\/photographer\/dashboard/)
        })

        test('Client can navigate between dashboard sections', async ({ page }) => {
            // Navigate first to set the origin
            await page.goto('/client/dashboard')
            
            // Set up authenticated session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 2,
                name: 'Test Client',
                email: 'client@moussawer.test',
                role: 'client',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/client\/dashboard/)

            // Navigate to My Bookings
            await page.getByRole('link', { name: /my bookings/i }).first().click()
            await expect(page).toHaveURL(/\/client\/bookings/)

            // Navigate to My Profile
            await page.getByRole('link', { name: /my profile/i }).first().click()
            await expect(page).toHaveURL(/\/client\/profile/)

            // Navigate back to Dashboard
            await page.getByRole('link', { name: /dashboard/i }).first().click()
            await expect(page).toHaveURL(/\/client\/dashboard/)
        })
    })

    test.describe('Authentication guards', () => {
        test('Logout clears session and redirects to login', async ({ page }) => {
            // Navigate first
            await page.goto('/client/dashboard')
            
            // Set up authenticated session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 1,
                name: 'Test User',
                email: 'test@moussawer.test',
                role: 'client',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')
            await expect(page).toHaveURL(/\/client\/dashboard/)

            // Click logout button
            await page.getByRole('button', { name: /logout/i }).click()

            // Should redirect to login page
            await expect(page).toHaveURL(/\/login/)

            // Auth data should be cleared
            await expect(page.evaluate(() => localStorage.getItem('auth_token'))).toBeNull()
            await expect(page.evaluate(() => localStorage.getItem('auth_user'))).toBeNull()
        })

        test('Authenticated users are redirected from login page', async ({ page }) => {
            // Navigate to login page first
            await page.goto('/login')
            
            // Set up authenticated session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 1,
                name: 'Test User',
                email: 'test@moussawer.test',
                role: 'client',
            })

            // Reload - should redirect to client dashboard
            await page.reload()
            await page.waitForLoadState('networkidle')

            // Should be redirected to client dashboard (role-based redirect)
            await expect(page).toHaveURL(/\/client\/dashboard/)
        })

        test('Unauthenticated users accessing protected routes are redirected to login', async ({ page }) => {
            // Clear any auth data
            await page.goto('/')
            await page.evaluate(() => {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
            })

            // Try to access photographer dashboard directly
            await page.goto('/photographer/dashboard')
            await page.waitForLoadState('networkidle')

            // Should redirect to login page
            await expect(page).toHaveURL(/\/login/)
        })
    })

    test.describe('Role-based access control', () => {
        test('Photographer cannot access client routes', async ({ page }) => {
            // Navigate first
            await page.goto('/photographer/dashboard')
            
            // Set up photographer session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 1,
                name: 'Test Photographer',
                email: 'test@moussawer.test',
                role: 'photographer',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')

            // Try to access client dashboard
            await page.goto('/client/dashboard')
            await page.waitForLoadState('networkidle')

            // Should be redirected (either to unauthorized or back to photographer dashboard)
            const url = page.url()
            const hasAccess = url.includes('/client/dashboard')
            expect(hasAccess).toBe(false)
        })

        test('Client cannot access photographer routes', async ({ page }) => {
            // Navigate first
            await page.goto('/client/dashboard')
            
            // Set up client session
            await page.evaluate((userData) => {
                localStorage.setItem('auth_token', 'test-token-123')
                localStorage.setItem('auth_user', JSON.stringify(userData))
            }, {
                id: 2,
                name: 'Test Client',
                email: 'client@moussawer.test',
                role: 'client',
            })

            // Reload to apply the auth state
            await page.reload()
            await page.waitForLoadState('networkidle')

            // Try to access photographer dashboard
            await page.goto('/photographer/dashboard')
            await page.waitForLoadState('networkidle')

            // Should be redirected
            const url = page.url()
            const hasAccess = url.includes('/photographer/dashboard')
            expect(hasAccess).toBe(false)
        })
    })
})
