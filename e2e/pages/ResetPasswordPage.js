/**
 * Page Object Model — Reset Password Page
 *
 * Encapsulates all selectors and interactions for the /reset-password page.
 */
export class ResetPasswordPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // --- Locators ---
        this.emailInput = page.locator('input[name="email"], [data-testid="email-input"]');
        this.tokenInput = page.locator('input[name="token"], [data-testid="token-input"]');
        this.passwordInput = page.locator('input[name="password"], [data-testid="password-input"]');
        this.passwordConfirmationInput = page.locator('input[name="password_confirmation"], [data-testid="password-confirmation-input"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message');
        this.successMessage = page.locator('.success-message');
        this.heading = page.locator('h1');
        this.fieldErrors = page.locator('.field-error');
    }

    /** Navigate to the reset-password page. */
    async goto(queryParams = {}) {
        const params = new URLSearchParams(queryParams).toString();
        const url = params ? `/reset-password?${params}` : '/reset-password';
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    /**
     * Fill and submit the reset-password form.
     * @param {{ email: string, token: string, password: string, password_confirmation: string }} data
     */
    async resetPassword(data) {
        await this.emailInput.fill(data.email);
        if (!this.tokenInput.inputElement()) {
            // Hidden input - set via evaluate
            await this.page.evaluate((token) => {
                document.querySelector('input[name="token"]').value = token;
            }, data.token);
        } else {
            await this.tokenInput.fill(data.token);
        }
        await this.passwordInput.fill(data.password);
        await this.passwordConfirmationInput.fill(data.password_confirmation);
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

    /** Get number of field errors */
    async getFieldErrorCount() {
        return await this.fieldErrors.count();
    }
}
