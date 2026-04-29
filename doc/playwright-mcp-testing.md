# Testing with the Playwright MCP Server

> **Purpose:** Standard procedure for validating UI changes using browser automation.

---

## Prerequisites

1. Playwright MCP server is running (check `.clinerules` or `doc/playwright-mcp-setup.md` if not)
2. Frontend dev server is running (`npx vite --port 5173`)
3. Backend API server is running (`npx tsx server/index.ts`) — needed for auth/API-based tests

> **If servers are not running:** Ask the user to start them. Do NOT attempt to start them in the background yourself.

---

## 1. Basic navigation test

```js
// Navigate to the app
await page.goto('http://localhost:5173/');
// Take a snapshot to inspect page content
await page.snapshot();
```

**What to check:**
- Page loads without errors (check console)
- Key elements are present (header, nav, main content)
- No unexpected redirects

---

## 2. Checking route guards (redirects)

### Test unauthenticated redirects:
```js
// Navigate to a protected route
await page.goto('http://localhost:5173/dashboard');
// Check if redirected to /login
const url = page.url(); // Should be http://localhost:5173/login
```

### Test role-based redirects:
```js
// 1. Log in as a non-admin user
// 2. Navigate to /admin
await page.goto('http://localhost:5173/admin');
const url = page.url(); // Should be http://localhost:5173/dashboard
```

---

## 3. Login via API (for role-specific tests)

When testing role-based access, use the API directly to set auth state:

```js
// Log in via API
const result = await page.evaluate(async () => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
  });
  const data = await response.json();
  if (data.data?.token) {
    localStorage.setItem('moussawer_token', data.data.token);
  }
  return { ok: response.ok, role: data.data?.user?.role };
});

// Navigate to the page you want to test
await page.goto('http://localhost:5173/admin');
await page.snapshot();
```

### Seed credentials:
| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@example.com | password |
| CLIENT | client@example.com | password |
| PHOTOGRAPHER | photographer-one@example.com | password |

---

## 4. Clearing auth state

```js
await page.evaluate(() => {
  localStorage.removeItem('moussawer_token');
});
```

---

## 5. Interacting with forms

```js
// Fill and submit
await page.getByLabel('Email').fill('admin@example.com');
await page.getByLabel('Password').fill('password');
await page.getByRole('button', { name: 'Log in' }).click();
await page.waitForTimeout(2000); // Wait for redirect
```

---

## 6. Inspecting network requests

```js
// Filter API calls
const requests = await page.networkRequests({ filter: '/api/' });
// Check for 200/401/500 status codes
```

---

## 7. Console error checking

```js
const errors = await page.consoleMessages({ level: 'error' });
// If errors exist, investigate
```

---

## 8. Full test checklist for UI changes

- [ ] Page loads without JS errors
- [ ] Unauthenticated users are redirected to `/login` for protected routes
- [ ] Authenticated users without the right role are redirected (e.g., non-ADMIN → `/dashboard`)
- [ ] Authenticated users with the right role can access the page
- [ ] Nav links are conditionally visible based on auth/role
- [ ] Forms submit correctly
- [ ] API data loads and displays

---

## 9. Common pitfalls

| Pitfall | Solution |
|---------|----------|
| `browser_click` fails with CSS selector error | Use `browser_run_code` with Playwright locators instead |
| Login works but page doesn't redirect | Check if backend API server is running |
| Console errors about fetch | Backend proxy might be down |
| Auth state persists between tests | Clear `localStorage` before each auth change |
| `browser_fill_form` fails | Use `browser_run_code` with `page.getByLabel()` instead |
