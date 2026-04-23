import { test, expect } from '../fixtures/index.js';

test.describe('Client Bookings', () => {
    const clientUser = {
        id: 1,
        name: 'Test Client',
        email: 'client@example.com',
        role: 'client'
    };

    const mockBookings = {
        data: [
            {
                id: 1,
                status: 'pending',
                scheduled_date: '2026-05-20T14:00:00Z',
                created_at: '2026-04-15T10:00:00Z',
                updated_at: '2026-04-15T10:00:00Z',
                notes: 'Family portrait session at the park',
                location: 'Stanley Park, Vancouver',
                event_type: 'portrait',
                guest_count: 5,
                photographer: {
                    id: 18,
                    phone: '+15551234567',
                    specialty: 'Portrait Photography',
                    user: {
                        id: 5,
                        name: 'John Doe',
                        email: 'john@example.com'
                    }
                },
                service: {
                    id: 1,
                    name: 'Portrait Session',
                    price: 200.00,
                    duration_minutes: 60,
                    minimum_hours: 1,
                    description: '1 hour outdoor portrait session.'
                },
                payment: {
                    status: 'pending',
                    amount: 200.00,
                    method: 'credit_card',
                    transaction_id: 'txn_123456'
                }
            },
            {
                id: 2,
                status: 'confirmed',
                scheduled_date: '2026-06-10T09:00:00Z',
                created_at: '2026-04-10T08:00:00Z',
                updated_at: '2026-04-12T15:00:00Z',
                notes: null,
                location: 'Downtown Studio',
                event_type: 'wedding',
                guest_count: 50,
                photographer: {
                    id: 22,
                    phone: '+15559876543',
                    specialty: 'Wedding Photography',
                    user: {
                        id: 8,
                        name: 'Jane Smith',
                        email: 'jane@example.com'
                    }
                },
                service: {
                    id: 2,
                    name: 'Wedding Photography',
                    price: 2500.00,
                    duration_minutes: 480,
                    minimum_hours: 8,
                    description: 'Full day wedding coverage.'
                },
                payment: {
                    status: 'completed',
                    amount: 2500.00,
                    method: 'bank_transfer',
                    transaction_id: 'txn_789012'
                }
            }
        ],
        meta: {
            current_page: 1,
            last_page: 1,
            total: 2
        }
    };

    const mockBookingDetail = {
        data: {
            id: 1,
            status: 'pending',
            scheduled_date: '2026-05-20T14:00:00Z',
            created_at: '2026-04-15T10:00:00Z',
            updated_at: '2026-04-15T10:00:00Z',
            notes: 'Family portrait session at the park',
            location: 'Stanley Park, Vancouver',
            event_type: 'portrait',
            guest_count: 5,
            photographer: {
                id: 18,
                phone: '+15551234567',
                specialty: 'Portrait Photography',
                user: {
                    id: 5,
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            },
            service: {
                id: 1,
                name: 'Portrait Session',
                price: 200.00,
                duration_minutes: 60,
                minimum_hours: 1,
                description: '1 hour outdoor portrait session.'
            },
            payment: {
                status: 'pending',
                amount: 200.00,
                method: 'credit_card',
                transaction_id: 'txn_123456'
            }
        }
    };

    test.beforeEach(async ({ page }) => {
        // Mock auth
        await page.route('**/api/user', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ user: clientUser }),
            });
        });

        await page.route('**/api/logout', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Logged out' }),
            });
        });

        // Mock bookings list
        await page.route('**/api/bookings', async (route) => {
            const url = route.request().url();
            // Only mock GET requests (list), not DELETE
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockBookings),
                });
            } else {
                await route.continue();
            }
        });

        // Mock booking detail view
        await page.route('**/api/bookings/1', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(mockBookingDetail),
                });
            } else {
                await route.continue();
            }
        });

        // Set auth in localStorage
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.evaluate((user) => {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', 'test-token');
        }, clientUser);

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // Navigate to client bookings page
        await page.goto('/client/bookings', { waitUntil: 'networkidle' });

        // Wait for the table to render
        await page.waitForSelector('.data-table', { state: 'visible', timeout: 15000 });
    });

    test('should display bookings list with view details button', async ({ page }) => {
        // Verify bookings are displayed
        const rows = page.locator('.data-table tbody tr');
        await expect(rows).toHaveCount(2);

        // Verify view details button exists for each row
        const viewButtons = page.locator('.btn-action.view');
        await expect(viewButtons).toHaveCount(2);
    });

    test('should open booking details modal on view button click', async ({ page }) => {
        // Click the first view button
        await page.locator('.btn-action.view').first().click();

        // Verify modal appears
        await expect(page.locator('.modal-overlay')).toBeVisible();
        await expect(page.locator('.booking-details-modal')).toBeVisible();

        // Verify modal title
        await expect(page.locator('.modal-header h2')).toContainText('Booking Details #1');

        // Verify booking info is displayed
        await expect(page.locator('.booking-details-modal')).toContainText('Portrait Session');
        await expect(page.locator('.booking-details-modal')).toContainText('John Doe');
        await expect(page.locator('.booking-details-modal')).toContainText('$200.00');
    });

    test('should close booking details modal on close button', async ({ page }) => {
        // Open modal
        await page.locator('.btn-action.view').first().click();
        await expect(page.locator('.modal-overlay')).toBeVisible();

        // Close modal
        await page.locator('.modal-actions .btn-secondary').click();
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('should close booking details modal on overlay click', async ({ page }) => {
        // Open modal
        await page.locator('.btn-action.view').first().click();
        await expect(page.locator('.modal-overlay')).toBeVisible();

        // Click overlay (outside modal content)
        await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
    });

    test('should show cancel confirmation dialog for pending booking', async ({ page }) => {
        // Click cancel button on first row (pending booking)
        await page.locator('.btn-action.delete').first().click();

        // Verify confirmation dialog appears
        await expect(page.locator('.confirmation-dialog')).toBeVisible();
        await expect(page.locator('.confirmation-dialog')).toContainText('Cancel Booking');
    });

    test('should close confirmation dialog on cancel', async ({ page }) => {
        // Open cancel dialog
        await page.locator('.btn-action.delete').first().click();
        await expect(page.locator('.confirmation-dialog')).toBeVisible();

        // Click cancel button in dialog
        await page.locator('.confirmation-dialog .btn-secondary').click();
        await expect(page.locator('.confirmation-dialog')).not.toBeVisible();
    });

    test('should cancel booking from details modal', async ({ page }) => {
        // Open booking details modal
        await page.locator('.btn-action.view').first().click();
        await expect(page.locator('.booking-details-modal')).toBeVisible();

        // Click cancel button inside modal
        await page.locator('.booking-details-modal .btn-danger').click();

        // Verify modal closed and confirmation dialog opened
        await expect(page.locator('.modal-overlay')).not.toBeVisible();
        await expect(page.locator('.confirmation-dialog')).toBeVisible();
        await expect(page.locator('.confirmation-dialog')).toContainText('Cancel Booking');
    });
});
