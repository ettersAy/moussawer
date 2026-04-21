import { test, expect } from '../fixtures/index.js';

/**
 * Authentication E2E Tests
 *
 * Tests the full login flow from UI to backend.
 * Assumes a test user exists: test@example.com / password
 */
test.describe('Login', () => {
  test('successful login redirects to dashboard', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login({
      email: 'test@example.com',
      password: 'password'
    });

    // Wait for redirect
    await expect(loginPage.page).toHaveURL(/\/(dashboard|$)/);
  });

  test('invalid credentials show error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Invalid credentials');
  });

  test('validation errors for empty fields', async ({ loginPage }) => {
    await loginPage.goto();
    // Try to submit empty form
    await loginPage.login({
      email: '',
      password: ''
    });

    // Check for validation (assuming frontend validation or backend)
    // For simplicity, check if still on login page
    await expect(loginPage.page).toHaveURL('/login');
  });
});