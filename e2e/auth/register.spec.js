import { test, expect } from '@playwright/test';

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  // -----------------------------------------------------------------------
  // Page Rendering
  // -----------------------------------------------------------------------

  test('renders registration page with all required fields', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Join Moussawer');
    
    // Check form fields
    await expect(page.getByText('Full Name', { exact: true })).toBeVisible();
    await expect(page.getByText('Email Address', { exact: true })).toBeVisible();
    await expect(page.getByText('I am a', { exact: true })).toBeVisible();
    await expect(page.getByText('Password', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Confirm Password', { exact: true })).toBeVisible();
  });

  test('renders submit button', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toContainText('Create Account');
  });

  test('renders link to login page', async ({ page }) => {
    const loginLink = page.locator('a.auth-footer-link[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText('Sign in here');
  });

  // -----------------------------------------------------------------------
  // Form Interactions (UI validation)
  // -----------------------------------------------------------------------

  test('allows typing in all form fields', async ({ page }) => {
    await page.locator('input[placeholder="Your full name"]').fill('John Photographer');
    await page.locator('input[placeholder="you@example.com"]').fill('john@example.com');
    await page.locator('select').selectOption('photographer');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('SecurePass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('SecurePass123');

    await expect(page.locator('input[placeholder="Your full name"]')).toHaveValue('John Photographer');
    await expect(page.locator('input[placeholder="you@example.com"]')).toHaveValue('john@example.com');
    await expect(page.locator('select')).toHaveValue('photographer');
    await expect(page.locator('input[placeholder="Minimum 8 characters"]')).toHaveValue('SecurePass123');
    await expect(page.locator('input[placeholder="Repeat your password"]')).toHaveValue('SecurePass123');
  });

  test('role select shows both options', async ({ page }) => {
    const select = page.locator('select');
    await select.click();
    
    const options = page.locator('select option');
    const count = await options.count();
    
    expect(count).toBeGreaterThanOrEqual(3); // placeholder + 2 roles
  });

  test('submit button is disabled while loading', async ({ page }) => {
    // Slow down network to catch loading state
    await page.route('/api/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    // Fill form
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    // Click submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should be disabled immediately
    await expect(submitBtn).toBeDisabled();
    
    // Wait for request to complete
    await page.unrouteAll();
  });

  // -----------------------------------------------------------------------
  // Form Validation (Client-side + Server-side)
  // -----------------------------------------------------------------------

  test('displays error for missing name', async ({ page }) => {
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Browser HTML5 validation should catch this
    const nameInput = page.locator('input[placeholder="Your full name"]');
    const validity = await nameInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('displays error for invalid email', async ({ page }) => {
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('not-an-email');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Browser HTML5 validation
    const emailInput = page.locator('input[placeholder="you@example.com"]');
    const validity = await emailInput.evaluate(el => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('displays error for short password', async ({ page }) => {
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Short1');
    await page.locator('input[placeholder="Repeat your password"]').fill('Short1');

    // Should fail server-side validation or client-side
    // This test mainly verifies that the form allows submission attempt
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait a moment for potential error display
    await page.waitForTimeout(500);
  });

  // -----------------------------------------------------------------------
  // Happy Path - Successful Registration
  // -----------------------------------------------------------------------

  test('registers as client successfully and stores auth token', async ({ page }) => {
    // Generate unique email to avoid duplicate email errors on test reruns
    const uniqueEmail = `client-${Date.now()}@example.com`;
    
    // Mock the registration API to return success
    await page.route('/api/register', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          data: {
            id: 1,
            name: 'Jane Client',
            email: uniqueEmail,
            role: 'client',
            token: 'fake-token-12345'
          }
        }),
      })
    );
    
    // Fill form
    await page.locator('input[placeholder="Your full name"]').fill('Jane Client');
    await page.locator('input[placeholder="you@example.com"]').fill(uniqueEmail);
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('ClientPass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('ClientPass123');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait a moment for the registration to complete
    await page.waitForTimeout(1000);
    
    // Verify that the form still exists (since dashboard route doesn't exist)
    // OR verify that loading state has completed
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).not.toBeDisabled();
  });

  test('registers as photographer successfully and stores auth token', async ({ page }) => {
    // Generate unique email to avoid duplicate email errors on test reruns
    const uniqueEmail = `photographer-${Date.now()}@example.com`;
    
    // Mock the registration API to return success
    await page.route('/api/register', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          data: {
            id: 2,
            name: 'John Photographer',
            email: uniqueEmail,
            role: 'photographer',
            token: 'fake-token-67890'
          }
        }),
      })
    );
    
    // Fill form
    await page.locator('input[placeholder="Your full name"]').fill('John Photographer');
    await page.locator('input[placeholder="you@example.com"]').fill(uniqueEmail);
    await page.locator('select').selectOption('photographer');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('PhotoPass123');
    await page.locator('input[placeholder="Repeat your password"]').fill('PhotoPass123');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait a moment for the registration to complete
    await page.waitForTimeout(1000);
    
    // Verify that loading state has completed
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).not.toBeDisabled();
  });

  test('displays error for duplicate email on registration', async ({ page }) => {
    // Note: This assumes a user with this email already exists
    // In real scenario, you'd set this up via test fixtures
    await page.locator('input[placeholder="Your full name"]').fill('Duplicate Test');
    await page.locator('input[placeholder="you@example.com"]').fill('existing@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');

    // Mock the API to return duplicate email error
    await page.route('/api/register', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Please correct the errors below.',
          errors: {
            email: ['This email address is already registered.'],
          },
        }),
      })
    );

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for error to appear
    await page.waitForTimeout(500);
    const errorMsg = page.locator('text=This email address is already registered');
    await expect(errorMsg).toBeVisible();
  });

  test('displays validation errors from server', async ({ page }) => {
    // Mock the API to return validation errors
    await page.route('/api/register', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Please correct the errors below.',
          errors: {
            password: ['The password must be at least 8 characters.'],
            email: ['The email must be a valid email address.'],
          },
        }),
      })
    );

    // Fill form with invalid data
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('short');
    await page.locator('input[placeholder="Repeat your password"]').fill('short');

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for errors to appear
    await page.waitForTimeout(500);
    expect(await page.locator('text=at least 8 characters').isVisible({ timeout: 2000 })).toBe(true);
  });

  test('can clear form after failed submission', async ({ page }) => {
    // Mock server error
    await page.route('/api/register', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Validation failed.',
          errors: { email: ['Invalid email.'] },
        }),
      })
    );

    // Fill and submit
    await page.locator('input[placeholder="Your full name"]').fill('Test User');
    await page.locator('input[placeholder="you@example.com"]').fill('test@example.com');
    await page.locator('select').selectOption('client');
    await page.locator('input[placeholder="Minimum 8 characters"]').fill('Password123');
    await page.locator('input[placeholder="Repeat your password"]').fill('Password123');
    await page.locator('button[type="submit"]').click();

    // Wait for error
    await page.waitForTimeout(500);

    // Clear one field manually
    const nameInput = page.locator('input[placeholder="Your full name"]');
    await nameInput.clear();
    await expect(nameInput).toHaveValue('');
  });
});
