/**
 * Page Object Model — Forgot Password Page
 *
 * Encapsulates all selectors and interactions for the /forgot-password page.
 */
export class ForgotPasswordPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // --- Locators ---
        this.emailInput = page.locator('input[name="email"], [data-testid="email-input"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message');
        this.successMessage = page.locator('.success-message');
        this.heading = page.locator('h1');
    }

    /** Navigate to the forgot-password page. */
    async goto() {
        await this.page.goto('/forgot-password', { waitUntil: 'networkidle' });
    }

    /**
     * Fill and submit the forgot-password form.
     * @param {{ email: string }} data
     */
    async requestReset(data) {
        await this.emailInput.fill(data.email);
        await this.submitButton.click();
    }

    /** Check if success message is visible */
    async hasSuccessMessage() {
        return await this.successMessage.isVisible();
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
