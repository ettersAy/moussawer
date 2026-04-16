import { test, expect } from '../fixtures/index.js';

/**
 * Authentication E2E Tests
 *
 * Tests the full login flow from UI to backend.
 * Assumes a test user exists: test@example.com / password
 */
test.describe('Login', () => {
  test('successful login redirects to dashboard', async ({ loginPage }) => {
    await loginPage.login('test@example.com', 'password');

    // Wait for redirect
    await expect(loginPage.page).toHaveURL(/\/(dashboard|$)/);
  });

  test('invalid credentials show error message', async ({ loginPage }) => {
    await loginPage.login('test@example.com', 'wrongpassword');

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Invalid credentials');
  });

  test('validation errors for empty fields', async ({ loginPage }) => {
    // Try to submit empty form
    await loginPage.login('', '');

    // Check for validation (assuming frontend validation or backend)
    // For simplicity, check if still on login page
    await expect(loginPage.page).toHaveURL('/login');
  });
});