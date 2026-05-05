# Browser Testing Patterns — Moussawer

Copy-paste Playwright code snippets for testing the app in the MCP browser.

---

## Setup: Login via API (bypass form issues)

```js
// Clear session and login as any role
await page.evaluate((creds) => {
  const { email, password } = creds;
  localStorage.removeItem('moussawer_token');
  return fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json()).then(data => {
    if (data.data?.token) localStorage.setItem('moussawer_token', data.data.token);
    return data;
  });
}, { email: 'admin@example.com', password: 'password' });

// Navigate to protected page
await page.goto('http://localhost:5173/admin');
await page.waitForTimeout(1000);
```

## Test Accounts

| Email | Password | Role | Dashboard URL |
|-------|----------|------|--------------|
| admin@example.com | password | ADMIN | /admin |
| client@example.com | password | CLIENT | /dashboard |
| photographer-one@example.com | password | PHOTOGRAPHER | /photographer |

## Role-Specific Page Checks

### Admin
```js
const text = await page.locator('body').textContent();
const checks = {
  tabs: ['Overview', 'Users', 'Bookings', 'Incidents', 'Disputes', 'Categories', 'Activity'],
  stats: text.includes('Total users'),
  users: text.includes('admin@example.com'),
};
// Verify: tabs.every(t => text.includes(t))
```

### Photographer
```js
const text = await page.locator('body').textContent();
const checks = {
  workspace: text.includes('Photographer workspace'),
  tabs: ['Bookings', 'Services', 'Portfolio', 'Calendar', 'Profile'],
  services: text.includes('Signature Portrait'),
  bookings: text.includes('Pending') || text.includes('Confirmed'),
};
```

### Client
```js
const text = await page.locator('body').textContent();
const checks = {
  welcome: text.includes('Welcome back'),
  bookings: text.includes('Your Bookings'),
  messages: true, // navigate to /messages and check
};
```

## Public Pages (no auth)
```js
await page.evaluate(() => localStorage.clear());
await page.goto('http://localhost:5173/');     // Home
await page.goto('http://localhost:5173/photographers'); // Discovery
await page.goto('http://localhost:5173/support');       // Support
// All should stay on their URLs without redirecting to /login
```

## Quick Page Text Dump
```js
// Get first 500 chars of body text for any page
const text = await page.locator('body').textContent();
console.log(text.substring(0, 500));
```

## Full Role Simulation
```js
async (page) => {
  const BASE = 'http://localhost:5173';
  
  // Helper
  async function loginAs(email, password) {
    await page.goto(BASE + '/login');
    await page.waitForTimeout(300);
    await page.evaluate((creds) => {
      const { email, password } = creds;
      localStorage.removeItem('moussawer_token');
      return fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(r => r.json()).then(d => {
        localStorage.setItem('moussawer_token', d.data.token);
        return d.data.user.role;
      });
    }, { email, password });
  }
  
  // Client
  await loginAs('client@example.com', 'password');
  await page.goto(BASE + '/dashboard'); // verify bookings
  await page.goto(BASE + '/messages');  // verify conversations
  
  // Photographer
  await loginAs('photographer-one@example.com', 'password');
  await page.goto(BASE + '/photographer'); // verify workspace + tabs
  
  // Admin
  await loginAs('admin@example.com', 'password');
  await page.goto(BASE + '/admin'); // verify stats + all tabs
}
```

## Taking Screenshots
```js
await page.screenshot({ path: '/tmp/moussawer-page.png', fullPage: true });
// View with: Read tool on the file path
```
