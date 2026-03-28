# 🏆 Playwright Best Practices for Moussawer

This guide outlines the best practices for writing maintainable, reliable, and robust end-to-end tests using Playwright in the Moussawer project. We strictly follow the **Page Object Model (POM)** and utilize **custom fixtures**.

---

## 🏗️ 1. Architecture: Page Object Model (POM)

Never scatter raw DOM selectors (like `page.locator('.submit-btn')`) across your test files.
Always encapsulate a page's elements and actions within a dedicated Class in the `e2e/pages/` directory.

### Why?

1. **Maintainability:** If a class or ID changes, you update it in *one* file, not in 20 test files.
2. **Readability:** Tests read like plain English (`contactPage.fillAndSubmit(...)`).
3. **Reusability:** Common actions (checking if loaded, submitting, waiting) can be reused securely.

### Example: A Generic Page Object (`e2e/pages/ExamplePage.js`)

```javascript
export class ExamplePage {
  constructor(page) {
    this.page = page;

    // Define all locators here
    this.title = page.locator('h1.page-title');
    this.emailInput = page.getByLabel('Email Address'); // Prefer getByLabel over CSS when possible
    this.roleDropdown = page.locator('select#user-role');
    this.submitBtn = page.getByRole('button', { name: 'Save Settings' });
  }

  async goto() {
    await this.page.goto('/example');
  }

  // Complex interaction encapsulated
  async fillDetails(email, role) {
    await this.emailInput.fill(email);
    // Playwright selects by value or label natively
    await this.roleDropdown.selectOption(role);
    await this.submitBtn.click();
  }
}
```

---

## 🔌 2. Custom Fixtures (Auto-Wiring)

Instead of manually instantiating Page Objects in every `beforeEach` block, we use Playwright's Fixtures to auto-wire them. This is defined in `e2e/fixtures/index.js`.

### Why?

1. **Zero Boilerplate:** You don't need `const page = new ExamplePage(page); await page.goto();` in every test.
2. **Lazy Loading:** The fixture is only instantiated if a test asks for it.

### Example: Using a Fixture

```javascript
// Import 'test' from our CUSTOM fixture file, NOT '@playwright/test'
import { test, expect } from '../fixtures/index.js';

// The 'examplePage' argument automatically provides a navigated, ready-to-use POM instance
test('it submits successfully', async ({ examplePage }) => {
  await examplePage.fillDetails('admin@test.com', 'admin');
  await expect(examplePage.title).toHaveText('Success');
});
```

---

## 🛡️ 3. Handling API Calls (Mocking vs Real)

End-to-end tests can either hit the real backend or mock it.
For UI specific behavior (like showing an error state), **mocking is faster and much less flaky**.

### Mocking Example (Intercepting)

Use `page.route` to catch requests to the backend and return simulated responses. This prevents polluting the database and needing complex setups/teardowns.

```javascript
test('shows a 422 error gracefully', async ({ examplePage, page }) => {
  // 1. Setup the intercept
  await page.route('/api/submit', async route => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid data' })
    });
  });

  // 2. Perform the action
  await examplePage.fillDetails('bad', 'client');

  // 3. Assert the UI reacted correctly to the 422
  await expect(examplePage.page.locator('.error-banner')).toBeVisible();
});
```

---

## ⏱️ 4. Handling Delays and Loading States

**Do not use `page.waitForTimeout(1000)`.** It makes tests slow and flaky.
Playwright has auto-waiting built-in. If you need to test a loading spinner, pause the network intentionally.

### Testing Loading States gracefully

```javascript
test('button is disabled while submitting', async ({ examplePage, page }) => {
  // Catch the route, but don't respond immediately
  await page.route('/api/submit', async route => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate slow network
    await route.continue(); // Let it hit the real backend
  });

  await examplePage.fillDetails('test@test.com', 'client');

  // Because the network is stalled, the button should currently be disabled
  await expect(examplePage.submitBtn).toBeDisabled();
  
  // Clean up
  await page.unrouteAll();
});
```

---

## ✅ 5. Common Selectors: Do's and Don'ts

Playwright provides powerful semantic locators. Use them over fragile CSS selectors.

### 🟢 DO (Resilient)

- `page.getByRole('button', { name: 'Submit' })`
- `page.getByLabel('Password')`
- `page.getByPlaceholder('Ex: jdoe@gmail.com')`
- `page.getByText('Welcome back, Admin')`

### 🔴 DON'T (Fragile)

- `page.locator('.btn-primary.mt-4.w-full')` (Tailwind classes change often)
- `page.locator('div > div > form > button')` (Structure changes break this instantly)
- `page.locator('#submit-btn-2')` (Dynamic IDs break)

### Testing Selects/Dropdowns

```javascript
// Given HTML: <select id="role"><option value="admin">Administrator</option></select>

// In POM: this.roleSelect = page.locator('#role')

// Select by value
await this.roleSelect.selectOption('admin');

// Select by Label (text visible to user)
await this.roleSelect.selectOption({ label: 'Administrator' });
```

---

## 🚫 6. Common Developer Errors

1. **Forgetting to `await` locator actions:**

   ```javascript
   // ❌ Bad - Will fail silently or intermittently
   expect(examplePage.title).toBeVisible();
   
   // ✅ Good 
   await expect(examplePage.title).toBeVisible();
   ```

2. **Testing in production environments:**
   Ours runs against `localhost:80` inside Sail. Ensure `DB_DATABASE=testing` is set if you write tests that mutate data, to avoid wiping your local dev db. (This is why API mocking via `page.route` is heavily preferred).

3. **Using `only` and forgetting it:**

   ```javascript
   test.only('runs just this test', () => { ... })
   ```

   *Note: Our `playwright.config.js` will intentionally crash the CI build if `test.only` is checked in.*
