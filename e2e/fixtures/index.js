import { test as base } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage.js';

/**
 * Custom Fixtures
 *
 * Extends the base Playwright `test` function with lazily-instantiated
 * Page Objects. Each test that destructs `{ contactPage }` automatically
 * gets a fresh, pre-navigated instance without any boilerplate.
 *
 * Pattern: https://playwright.dev/docs/test-fixtures
 */
export const test = base.extend({
  /**
   * Provides a ContactPage instance already navigated to /contact.
   * Use in tests: `test('...', async ({ contactPage }) => { ... })`
   */
  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await contactPage.goto();
    await use(contactPage);
  },
});

export { expect } from '@playwright/test';
