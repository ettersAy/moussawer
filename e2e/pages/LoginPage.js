/**
 * Page Object Model — Login Page
 *
 * Encapsulates all selectors and interactions for the /login page.
 * Tests import this class and call its methods instead of scattering
 * raw selectors across test files (easier to maintain when the UI changes).
 *
 * Pattern: https://playwright.dev/docs/pom
 */
export class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // --- Locators (single source of truth for all selectors) ---
        this.emailInput = page.locator('input[name="email"], [data-testid="email-input"]');
        this.passwordInput = page.locator('input[name="password"], [data-testid="password-input"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message');
        this.heading = page.locator('h1');
    }

    /** Navigate to the login page. */
    async goto() {
        await this.page.goto('/login', { waitUntil: 'networkidle' });
    }

    /**
     * Fill and submit the login form.
     * @param {{ email: string, password: string }} credentials
     */
    async login(credentials) {
        await this.emailInput.fill(credentials.email);
        await this.passwordInput.fill(credentials.password);
        await this.submitButton.click();
    }

    /** Wait for navigation after login */
    async waitForNavigation() {
        await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    /** Check if error message is visible */
    async hasErrorMessage() {
        return await this.errorMessage.isVisible();
    }

    /** Get error message text */
    async getErrorMessage() {
        return await this.errorMessage.textContent();
    }
}