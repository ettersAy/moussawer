import { type Page } from "@playwright/test";

/**
 * Page Object Model for the Login page.
 *
 * Encapsulates all locators and actions related to the /login route,
 * following Playwright best practices: user-facing locators only.
 */
export class LoginPage {
  readonly page: Page;

  // Locators — all user-facing (no CSS classes, no XPath)
  readonly heading = () => this.page.getByRole("heading", { name: /welcome back/i });
  readonly emailInput = () => this.page.getByRole("textbox", { name: /email/i });
  readonly passwordInput = () => this.page.getByLabel(/password/i);
  readonly submitButton = () => this.page.getByRole("button", { name: /log in/i });
  readonly errorMessage = () => this.page.getByText("Invalid email or password");
  readonly registerLink = () => this.page.getByRole("link", { name: /create an account/i });

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to the login page and wait for the form to render. */
  async goto() {
    await this.page.goto("/login");
    await this.heading().waitFor({ state: "visible" });
  }

  /** Fill the email field. */
  async fillEmail(email: string) {
    await this.emailInput().fill(email);
  }

  /** Fill the password field. */
  async fillPassword(password: string) {
    await this.passwordInput().fill(password);
  }

  /** Click the Log in button. */
  async submit() {
    await this.submitButton().click();
  }

  /** Convenience: fill credentials and submit in one call. */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Assert that the login form is fully rendered. */
  async expectOnPage() {
    await this.heading().waitFor({ state: "visible" });
    await this.emailInput().waitFor({ state: "visible" });
    await this.passwordInput().waitFor({ state: "visible" });
    await this.submitButton().waitFor({ state: "visible" });
  }

  /** Assert that an error message is displayed (invalid credentials). */
  async expectErrorVisible() {
    await this.errorMessage().waitFor({ state: "visible", timeout: 10_000 });
  }
}
