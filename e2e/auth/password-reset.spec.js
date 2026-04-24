import { test, expect } from '../fixtures/index.js';

/**
 * Password Reset E2E Tests
 *
 * Tests the full password reset flow: forgot-password → reset-password.
 * All tests use mocked API responses to simulate various scenarios.
 */
test.describe('Password Reset Flows', () => {
    // -----------------------------------------------------------------------
    // Helper: Common mock routes used across multiple tests
    // -----------------------------------------------------------------------
    const DEFAULT_API_MOCKS = {
        forgotPassword: {
            status: 200,
            body: { message: 'We have emailed your password reset link.' },
        },
        resetPassword: {
            status: 200,
            body: { message: 'Your password has been reset.' },
        },
    };

    test.beforeEach(async ({ page }) => {
        // Clear any auth state
        await page.evaluate(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        });
    });

    // =======================================================================
    // FORGOT PASSWORD PAGE
    // =======================================================================

    test.describe('Forgot Password Page — Page Rendering', () => {
        test('renders the forgot-password page with correct title', async ({ page }) => {
            await page.goto('/forgot-password');
            await expect(page.locator('h1')).toContainText('Reset Password');
        });

        test('renders email input field', async ({ page }) => {
            await page.goto('/forgot-password');
            await expect(page.getByText('Email Address', { exact: true })).toBeVisible();
            const input = page.locator('input[type="email"]');
            await expect(input).toBeVisible();
        });

        test('renders submit button', async ({ page }) => {
            await page.goto('/forgot-password');
            const submitBtn = page.locator('button[type="submit"]');
            await expect(submitBtn).toBeVisible();
            await expect(submitBtn).toBeEnabled();
            await expect(submitBtn).toContainText('Send Reset Link');
        });

        test('renders link back to login page', async ({ page }) => {
            await page.goto('/forgot-password');
            const loginLink = page.locator('a[href="/login"]').first();
            await expect(loginLink).toBeVisible();
            await expect(loginLink).toContainText('Sign in here');
        });
    });

    test.describe('Forgot Password Page — Success State', () => {
        test('shows success message after submitting valid email', async ({ page }) => {
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(DEFAULT_API_MOCKS.forgotPassword.body),
                })
            );

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.locator('button[type="submit"]').click();

            // Should show success message
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.success-message')).toContainText(
                "we've sent a password reset link"
            );
        });

        test('shows success with link back to login after submit', async ({ page }) => {
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(DEFAULT_API_MOCKS.forgotPassword.body),
                })
            );

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.locator('button[type="submit"]').click();

            // Should show "Back to Login" link
            await expect(page.locator('a[href="/login"]')).toBeVisible();
        });
    });

    test.describe('Forgot Password Page — Validation & Errors', () => {
        test('displays browser validation for empty email', async ({ page }) => {
            await page.goto('/forgot-password');
            await page.locator('button[type="submit"]').click();

            const emailInput = page.locator('input[type="email"]');
            const validity = await emailInput.evaluate((el) => el.validity.valid);
            expect(validity).toBe(false);
        });

        test('displays browser validation for invalid email format', async ({ page }) => {
            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('not-an-email');
            await page.locator('button[type="submit"]').click();

            const emailInput = page.locator('input[type="email"]');
            const validity = await emailInput.evaluate((el) => el.validity.valid);
            expect(validity).toBe(false);
        });

        test('displays validation error from server', async ({ page }) => {
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Please correct the errors below.',
                        errors: {
                            email: ['Please provide a valid email address.'],
                        },
                    }),
                })
            );

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('invalid@');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toBeVisible();
            await expect(page.locator('.error-message')).toContainText(
                'Please provide a valid email address'
            );
        });

        test('displays rate limit error', async ({ page }) => {
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 429,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Too many requests. Please try again later.',
                    }),
                })
            );

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toContainText(
                'Too many requests'
            );
        });

        test('displays generic error on server failure', async ({ page }) => {
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Something went wrong. Please try again later.',
                    }),
                })
            );

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toContainText(
                'Something went wrong'
            );
        });

        test('submit button shows loading state', async ({ page }) => {
            await page.route('/api/forgot-password', async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(DEFAULT_API_MOCKS.forgotPassword.body),
                });
            });

            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');

            const submitBtn = page.locator('button[type="submit"]');
            await submitBtn.click();

            // Button should be disabled and show loading text
            await expect(submitBtn).toBeDisabled();
            await expect(submitBtn).toContainText('Sending Link...');
        });
    });

    // =======================================================================
    // RESET PASSWORD PAGE
    // =======================================================================

    test.describe('Reset Password Page — Page Rendering', () => {
        test('renders the reset-password page with correct title', async ({ page }) => {
            await page.goto('/reset-password');
            await expect(page.locator('h1')).toContainText('Set New Password');
        });

        test('renders all form fields', async ({ page }) => {
            await page.goto('/reset-password');
            await expect(page.getByText('Email Address', { exact: true })).toBeVisible();
            await expect(page.getByText('New Password', { exact: true })).toBeVisible();
            await expect(page.getByText('Confirm New Password', { exact: true })).toBeVisible();
        });

        test('renders submit button', async ({ page }) => {
            await page.goto('/reset-password');
            const submitBtn = page.locator('button[type="submit"]');
            await expect(submitBtn).toBeVisible();
            await expect(submitBtn).toBeEnabled();
            await expect(submitBtn).toContainText('Reset Password');
        });

        test('renders link back to login page', async ({ page }) => {
            await page.goto('/reset-password');
            const loginLink = page.locator('a[href="/login"]').first();
            await expect(loginLink).toBeVisible();
            await expect(loginLink).toContainText('Sign in here');
        });

        test('pre-fills email and token from query parameters', async ({ page }) => {
            const email = 'user@example.com';
            const token = 'test-reset-token-123';
            await page.goto(`/reset-password?email=${encodeURIComponent(email)}&token=${token}`);

            // Email should be pre-filled
            await expect(page.locator('input[type="email"]')).toHaveValue(email);
            // Token should be in the hidden input
            const tokenValue = await page.evaluate(() => document.querySelector('input[name="token"]').value);
            expect(tokenValue).toBe(token);
        });
    });

    test.describe('Reset Password Page — Success State', () => {
        test('shows success message after valid reset', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Your password has been reset.' }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'valid-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            // Should show success message
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.success-message')).toContainText(
                'password has been reset successfully'
            );
        });

        test('shows Sign In link after successful reset', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Your password has been reset.' }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'valid-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            // Should have a "Sign In" link (styled as button)
            await expect(page.locator('a[href="/login"]').first()).toBeVisible();
            await expect(page.locator('a[href="/login"]').first()).toContainText('Sign In');
        });
    });

    test.describe('Reset Password Page — Validation & Errors', () => {
        test('displays validation errors for empty fields', async ({ page }) => {
            await page.goto('/reset-password');
            await page.locator('button[type="submit"]').click();

            // HTML5 validation should prevent submission
            const emailInput = page.locator('input[type="email"]');
            const validity = await emailInput.evaluate((el) => el.validity.valid);
            expect(validity).toBe(false);
        });

        test('displays password mismatch error from server', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Please correct the errors below.',
                        errors: {
                            password: ['The password field confirmation does not match.'],
                        },
                    }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'token';
            });
            await page.locator('input[name="password"]').fill('Password123');
            await page.locator('input[name="password_confirmation"]').fill('DifferentPass456');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.field-error')).toContainText(
                'does not match'
            );
        });

        test('displays invalid token error', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 422,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Invalid or expired reset token.',
                    }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'invalid-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toContainText(
                'Invalid or expired reset token'
            );
        });

        test('displays rate limit error', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 429,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Too many requests. Please try again later.',
                    }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'some-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toContainText(
                'Too many requests'
            );
        });

        test('displays generic error on server failure', async ({ page }) => {
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Something went wrong. Please try again.',
                    }),
                })
            );

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'some-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('.error-message')).toContainText(
                'Something went wrong'
            );
        });

        test('submit button shows loading state', async ({ page }) => {
            await page.route('/api/reset-password', async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Your password has been reset.' }),
                });
            });

            await page.goto('/reset-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.evaluate(() => {
                document.querySelector('input[name="token"]').value = 'valid-token';
            });
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');

            const submitBtn = page.locator('button[type="submit"]');
            await submitBtn.click();

            // Button should be disabled and show loading text
            await expect(submitBtn).toBeDisabled();
            await expect(submitBtn).toContainText('Resetting Password...');
        });
    });

    // =======================================================================
    // INTEGRATION — Full Reset Flow via Login Page
    // =======================================================================

    test.describe('Integration — Full Flow', () => {
        test('login page has link to forgot-password', async ({ page }) => {
            await page.goto('/login');
            const forgotLink = page.locator('a[href="/forgot-password"]');
            await expect(forgotLink).toBeVisible();
            await expect(forgotLink).toContainText('Forgot Password');
        });

        test('navigates from login to forgot-password via link', async ({ page }) => {
            await page.goto('/login');
            await page.locator('a[href="/forgot-password"]').click();
            await expect(page).toHaveURL('/forgot-password');
            await expect(page.locator('h1')).toContainText('Reset Password');
        });

        test('complete flow: forgot → reset → login link appears', async ({ page }) => {
            // Mock forgot-password
            await page.route('/api/forgot-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'We have emailed your password reset link.' }),
                })
            );

            // Mock reset-password
            await page.route('/api/reset-password', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Your password has been reset.' }),
                })
            );

            // Step 1: Request password reset
            await page.goto('/forgot-password');
            await page.locator('input[type="email"]').fill('user@example.com');
            await page.locator('button[type="submit"]').click();
            await expect(page.locator('.success-message')).toBeVisible();

            // Step 2: Simulate navigating to reset-password with token
            await page.goto('/reset-password?token=test-token&email=user@example.com');
            await page.locator('input[name="password"]').fill('NewPass123');
            await page.locator('input[name="password_confirmation"]').fill('NewPass123');
            await page.locator('button[type="submit"]').click();

            // Should see success
            await expect(page.locator('.success-message')).toBeVisible();
            await expect(page.locator('.success-message')).toContainText(
                'password has been reset successfully'
            );

            // Should see Sign In link
            await expect(page.locator('a[href="/login"]').first()).toBeVisible();
        });
    });

    // =======================================================================
    // AUTH GUARD — Redirect when authenticated
    // =======================================================================

    test.describe('Auth Guard — Guest-only Access', () => {
        test('redirects authenticated user from forgot-password to dashboard', async ({ page }) => {
            // Set up authenticated state
            await page.goto('/');
            await page.evaluate(() => {
                localStorage.setItem('auth_token', 'test-token');
                localStorage.setItem('auth_user', JSON.stringify({
                    id: 1, name: 'Test User', email: 'test@example.com', role: 'client',
                }));
            });

            // Mock /api/user for the auth guard
            await page.route('**/api/user', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'client' },
                    }),
                })
            );

            // Should redirect to client dashboard
            await page.goto('/forgot-password');
            await expect(page).toHaveURL(/\/client\/dashboard/);
        });

        test('redirects authenticated user from reset-password to dashboard', async ({ page }) => {
            await page.goto('/');
            await page.evaluate(() => {
                localStorage.setItem('auth_token', 'test-token');
                localStorage.setItem('auth_user', JSON.stringify({
                    id: 1, name: 'Test User', email: 'test@example.com', role: 'client',
                }));
            });

            await page.route('**/api/user', (route) =>
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'client' },
                    }),
                })
            );

            await page.goto('/reset-password');
            await expect(page).toHaveURL(/\/client\/dashboard/);
        });
    });
});
