/**
 * LoginPage Page Object
 *
 * Encapsulates interactions with the login form on /login.
 * Follows Page Object Model pattern for maintainable E2E tests.
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.url = '/login';

    // Locators
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-600');
  }

  /**
   * Navigate to the login page.
   */
  async goto() {
    await this.page.goto(this.url);
  }

  /**
   * Fill and submit the login form.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Get the error message text if present.
   * @returns {string|null}
   */
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  /**
   * Check if login was successful by checking URL or presence of logout button.
   * @returns {boolean}
   */
  async isLoggedIn() {
    // Assuming after login, redirects to / or shows logout
    await this.page.waitForURL('**/dashboard', { timeout: 5000 });
    return this.page.url().includes('/dashboard') || this.page.url().includes('/');
  }
}