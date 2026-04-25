import { test, expect } from '../fixtures/index.js';

test.describe('Client Booking Request Flow (Feature 3)', () => {
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
            user: { id: 5, name: 'John Doe', email: 'john@example.com' },
            services: [
                {
                    id: 1,
                    name: 'Wedding Photography',
                    description: 'Full day wedding coverage.',
                    price: 1200.00,
                    duration_minutes: 480,
                },
                {
                    id: 2,
                    name: 'Portrait Session',
                    description: '1 hour outdoor portrait session.',
                    price: 200.00,
                    duration_minutes: 60,
                }
            ]
        }
    };

    const mockAvailableSlots = {
        data: [
            { id: 1, photographer_id: 18, date: '2026-05-10', start_time: '09:00', end_time: '12:00', status: 'available' },
            { id: 2, photographer_id: 18, date: '2026-05-10', start_time: '13:00', end_time: '17:00', status: 'available' },
            { id: 3, photographer_id: 18, date: '2026-05-11', start_time: '10:00', end_time: '14:00', status: 'available' },
        ]
    };

    test.beforeEach(async ({ page }) => {
        // Mock auth endpoints
        await page.route('**/api/user', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: clientUser }) });
        });
        await page.route('**/api/logout', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Logged out' }) });
        });

        // Mock photographer details
        await page.route('**/api/photographers/18', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(photographerData) });
        });

        // Mock availability slots for the calendar
        await page.route('**/api/photographers/18/availability/slots**', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAvailableSlots) });
        });

        // Mock availability check (used during flow)
        await page.route('**/api/photographers/18/availability/check**', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ available: true }) });
        });

        // Set up auth
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate((user) => {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', 'test-token');
        }, clientUser);
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        await page.goto('/photographers/18/book', { waitUntil: 'networkidle' });
    });

    test('should display photographer details and services', async ({ page }) => {
        await expect(page.locator('.booking-request-view__title')).toContainText('Book John Doe');
        await expect(page.locator('.service-selector__item')).toHaveCount(2);
    });

    test('should display available dates in calendar when photographer loaded', async ({ page }) => {
        // Calendar days should render (photographerId is set in composable init)
        await expect(page.locator('.schedule-picker__day')).not.toHaveCount(0);
    });

    test('should update total when service changes', async ({ page }) => {
        const firstService = page.locator('.service-selector__item').first();
        await firstService.click();

        const summary = page.locator('.booking-summary__card');
        await expect(summary.locator('.booking-summary__row--total')).toContainText('$1200');
    });

    test('should fill event details with duration field visible', async ({ page }) => {
        await expect(page.locator('#duration')).toBeVisible();
    });

    test('should show pre-submit summary modal before confirming', async ({ page }) => {
        // Select service
        await page.locator('.service-selector__item').first().click();

        // Click Review & Confirm button
        await page.click('button:has-text("Review & Confirm")');

        // Modal should appear
        await expect(page.locator('.pre-submit-modal')).toBeVisible();
        await expect(page.locator('.pre-submit-modal')).toContainText('Wedding Photography');
        await expect(page.locator('.pre-submit-modal')).toContainText('$1200');
    });

    test('should submit booking after modal confirmation', async ({ page }) => {
        // Mock the booking submission
        await page.route('**/api/client/bookings', async (route, request) => {
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: { id: 101, status: 'pending', client_id: 1, photographer_id: 18, location: 'Park', duration_minutes: 480 }
                }),
            });
        });

        // Select service
        await page.locator('.service-selector__item').first().click();

        // Click Review & Confirm
        await page.click('button:has-text("Review & Confirm")');

        // Click Confirm in the modal
        await page.click('button:has-text("Confirm & Send Request")');

        // Success state
        await expect(page.locator('.booking-request-view__success')).toBeVisible();
    });

    test('should close modal on Edit Details', async ({ page }) => {
        await page.locator('.service-selector__item').first().click();
        await page.click('button:has-text("Review & Confirm")');
        await expect(page.locator('.pre-submit-modal')).toBeVisible();

        await page.click('button:has-text("Edit Details")');
        await expect(page.locator('.pre-submit-modal')).not.toBeVisible();
    });

    test('should show validation errors from server', async ({ page }) => {
        await page.route('**/api/client/bookings', async (route) => {
            await route.fulfill({
                status: 422,
                contentType: 'application/json',
                body: JSON.stringify({
                    errors: { location: ['The location field is required.'] }
                }),
            });
        });

        await page.locator('.service-selector__item').first().click();
        await page.click('button:has-text("Review & Confirm")');
        await page.click('button:has-text("Confirm & Send Request")');

        // Errors should appear in the form
        await expect(page.locator('.event-details-form__error').first()).toBeVisible();
    });
});
