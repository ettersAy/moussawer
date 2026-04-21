import { test, expect } from '../fixtures/index.js';

test.describe('Client Booking Request', () => {
    const clientUser = {
        id: 1,
        name: 'Test Client',
        email: 'client@example.com',
        role: 'client'
    };

    const photographerData = {
        data: {
            id: 18,
            bio: 'Expert photographer for all occasions.',
            hourly_rate: 150.00,
            rating: 4.8,
            user: {
                id: 5,
                name: 'John Doe',
                email: 'john@example.com'
            },
            services: [
                {
                    id: 1,
                    name: 'Wedding Photography',
                    description: 'Full day wedding coverage.',
                    price: 1200.00
                },
                {
                    id: 2,
                    name: 'Portrait Session',
                    description: '1 hour outdoor portrait session.',
                    price: 200.00
                }
            ]
        }
    };

    test.beforeEach(async ({ page }) => {
        // Mock /api/user endpoint to return the client user when the test token is used
        await page.route('**/api/user', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: clientUser
                }),
            });
        });

        // Mock /api/logout to prevent 401 errors
        await page.route('**/api/logout', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Logged out' }),
            });
        });

        // Set up mock before navigation
        await page.route('**/api/photographers/18', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(photographerData),
            });
        });

        // Set up auth in localStorage manually to avoid full setup complexity
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate((user) => {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', 'test-token');
        }, clientUser);
        
        // Reload the page so Vue auth store picks up the localStorage
        await page.reload({ waitUntil: 'networkidle' });
        
        // Wait a bit for Vue to initialize
        await page.waitForTimeout(500);
        
        // Navigate and wait for network to be idle
        await page.goto('/photographers/18/book', { waitUntil: 'networkidle' });
        
        // Wait for either the booking view or an error message
        try {
            await page.waitForSelector('.booking-request-view, [data-testid="auth-error"], .error-message', { state: 'visible', timeout: 15000 });
        } catch (error) {
            // If selector not found, check page content for debugging
            const html = await page.content();
            console.log('Page content (first 1000 chars):', html.substring(0, 1000));
            
            // Also check for any error messages in console
            const consoleMessages = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('script'))
                    .filter(s => s.textContent.includes('error') || s.textContent.includes('Error'))
                    .map(s => s.textContent.substring(0, 200));
            });
            if (consoleMessages.length > 0) {
                console.log('Possible script errors:', consoleMessages);
            }
            
            throw error;
        }
    });

    test('should display photographer details and services', async ({ page }) => {
        await expect(page.locator('.booking-request-view__title')).toContainText('Book John Doe');
        await expect(page.locator('.service-selector__item')).toHaveCount(2);
        await expect(page.locator('.service-selector__item').first()).toContainText('Wedding Photography');
        await expect(page.locator('.service-selector__item').first()).toContainText('$1200');
    });

    test('should update total price when a service is selected', async ({ page }) => {
        const firstService = page.locator('.service-selector__item').first();
        await firstService.click();
        
        const summary = page.locator('.booking-summary__card');
        await expect(summary.locator('.booking-summary__row').filter({ hasText: 'Service' })).toContainText('Wedding Photography');
        await expect(summary.locator('.booking-summary__row--total')).toContainText('$1200');
    });

    test('should submit booking request successfully', async ({ page }) => {
        const secondService = page.locator('.service-selector__item').nth(1);
        await secondService.click();
        
        await page.locator('input[type="datetime-local"]').fill('2026-05-20T14:00');
        await page.locator('input#location').fill('Stanley Park, Vancouver');
        await page.locator('textarea#notes').fill('Looking for some natural light shots.');

        await page.route('**/api/client/bookings', async (route) => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ data: { id: 101, status: 'pending' } }),
            });
        });

        await page.click('button:has-text("Request Booking")');
        await expect(page.locator('.booking-request-view__success')).toBeVisible();
    });

    test('should show validation errors from server', async ({ page }) => {
        const firstService = page.locator('.service-selector__item').first();
        await firstService.click();

        await page.route('**/api/client/bookings', async (route) => {
            await route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({
                    errors: {
                        scheduled_date: ['The scheduled date must be a date after now.'],
                        location: ['The location field is required.']
                    }
                }),
            });
        });

        await page.click('button:has-text("Request Booking")');
        await expect(page.locator('.error-message').filter({ hasText: 'The scheduled date must be a date after now.' })).toBeVisible();
    });
});
