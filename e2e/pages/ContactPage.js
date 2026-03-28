/**
 * Page Object Model — Contact Page
 *
 * Encapsulates all selectors and interactions for the /contact page.
 * Tests import this class and call its methods instead of scattering
 * raw selectors across test files (easier to maintain when the UI changes).
 *
 * Pattern: https://playwright.dev/docs/pom
 */
export class ContactPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // --- Locators (single source of truth for all selectors) ---
    this.emailInput   = page.locator('#email');
    this.messageInput = page.locator('#message');
    this.submitButton = page.locator('button[type="submit"]');
    this.feedback     = page.locator('.feedback');
    this.heading      = page.locator('h1');
  }

  /** Navigate to the contact page. */
  async goto() {
    await this.page.goto('/contact');
  }

  /**
   * Fill and submit the contact form.
   * @param {{ email: string, message: string }} data
   */
  async fillAndSubmit({ email, message }) {
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }

  /** Wait for the feedback banner to appear and return its text. */
  async getFeedbackText() {
    await this.feedback.waitFor({ state: 'visible' });
    return this.feedback.textContent();
  }

  /** Returns true if the feedback banner has the success CSS class. */
  async isSuccess() {
    await this.feedback.waitFor({ state: 'visible' });
    return this.feedback.evaluate(el => el.classList.contains('success'));
  }

  /** Returns true if the feedback banner has the error CSS class. */
  async isError() {
    await this.feedback.waitFor({ state: 'visible' });
    return this.feedback.evaluate(el => el.classList.contains('error'));
  }

  /** Returns true when the submit button is disabled (loading state). */
  isSubmitDisabled() {
    return this.submitButton.isDisabled();
  }
}
