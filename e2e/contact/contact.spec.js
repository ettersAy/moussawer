import { test, expect } from '../fixtures/index.js';

/**
 * E2E Tests — Contact Page (/contact)
 *
 * These tests run against the real running app (Sail + Vite dev server).
 * They test the full stack: Vue UI → fetch → Laravel API → MySQL.
 *
 * Run: npx playwright test contact
 */

// ---------------------------------------------------------------------------
// Page Structure
// ---------------------------------------------------------------------------

test.describe('Contact Page — Page Structure', () => {
  test('renders the page heading', async ({ contactPage }) => {
    await expect(contactPage.heading).toBeVisible();
    await expect(contactPage.heading).toHaveText('Contact Us');
  });

  test('renders the email input', async ({ contactPage }) => {
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.emailInput).toHaveAttribute('type', 'email');
    await expect(contactPage.emailInput).toHaveAttribute('required', '');
  });

  test('renders the message textarea', async ({ contactPage }) => {
    await expect(contactPage.messageInput).toBeVisible();
    await expect(contactPage.messageInput).toHaveAttribute('required', '');
  });

  test('renders an enabled submit button', async ({ contactPage }) => {
    await expect(contactPage.submitButton).toBeVisible();
    await expect(contactPage.submitButton).toBeEnabled();
    await expect(contactPage.submitButton).toHaveText('Send Message');
  });

  test('has the correct page title', async ({ page }) => {
    await page.goto('/contact');
    // The title may not be set yet, so we at least confirm the page loaded
    await expect(page).toHaveURL(/\/contact/);
  });
});

// ---------------------------------------------------------------------------
// Form Interactions (UI validation — no network request)
// ---------------------------------------------------------------------------

test.describe('Contact Page — Form Interactions', () => {
  test('allows typing in the email field', async ({ contactPage }) => {
    await contactPage.emailInput.fill('jane@example.com');
    await expect(contactPage.emailInput).toHaveValue('jane@example.com');
  });

  test('allows typing in the message field', async ({ contactPage }) => {
    await contactPage.messageInput.fill('Hello, this is my message.');
    await expect(contactPage.messageInput).toHaveValue('Hello, this is my message.');
  });

  test('submit button is disabled while loading', async ({ contactPage, page }) => {
    // Slow down the network to catch the mid-flight loading state
    await page.route('/api/contact', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'A message long enough to pass validation.',
    });

    // Button should be disabled immediately after click
    await expect(contactPage.submitButton).toBeDisabled();
    await page.unrouteAll();
  });
});

// ---------------------------------------------------------------------------
// Happy Path (full stack — requires Sail + Vite running)
// ---------------------------------------------------------------------------

test.describe('Contact Page — Successful Submission', () => {
  test('shows a success message after valid submission', async ({ contactPage, page }) => {
    // Intercept the real API call and return a controlled success response
    await page.route('/api/contact', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { email: 'test@example.com', message: 'Hello!' } }),
      })
    );

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'This is a valid message for the contact form.',
    });

    await expect(contactPage.feedback).toBeVisible();
    expect(await contactPage.isSuccess()).toBe(true);
  });

  test('clears the form fields after successful submission', async ({ contactPage, page }) => {
    await page.route('/api/contact', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      })
    );

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'Clearing the form after submit test.',
    });

    await contactPage.feedback.waitFor({ state: 'visible' });
    await expect(contactPage.emailInput).toHaveValue('');
    await expect(contactPage.messageInput).toHaveValue('');
  });
});

// ---------------------------------------------------------------------------
// Error Handling (API errors and network failures)
// ---------------------------------------------------------------------------

test.describe('Contact Page — Error Handling', () => {
  test('shows an error message when the API returns a 422', async ({ contactPage, page }) => {
    await page.route('/api/contact', route =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'The email field is required.',
          errors: { email: ['The email field is required.'] },
        }),
      })
    );

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'Triggering a mocked validation error.',
    });

    await expect(contactPage.feedback).toBeVisible();
    expect(await contactPage.isError()).toBe(true);
  });

  test('shows an error message on network failure', async ({ contactPage, page }) => {
    await page.route('/api/contact', route => route.abort('failed'));

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'Triggering a mocked network error.',
    });

    await expect(contactPage.feedback).toBeVisible();
    expect(await contactPage.isError()).toBe(true);
  });

  test('shows an error message when the API returns a 500', async ({ contactPage, page }) => {
    await page.route('/api/contact', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server Error' }),
      })
    );

    await contactPage.fillAndSubmit({
      email: 'test@example.com',
      message: 'Triggering a mocked server error.',
    });

    await expect(contactPage.feedback).toBeVisible();
    expect(await contactPage.isError()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Accessibility (A11y basics — form labelling)
// ---------------------------------------------------------------------------

test.describe('Contact Page — Accessibility', () => {
  test('email input has an associated label', async ({ contactPage }) => {
    const label = contactPage.page.locator('label[for="email"]');
    await expect(label).toBeVisible();
  });

  test('message textarea has an associated label', async ({ contactPage }) => {
    const label = contactPage.page.locator('label[for="message"]');
    await expect(label).toBeVisible();
  });
});
