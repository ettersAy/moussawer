# How to run Moussawer locally and test with Playwright

Step-by-step guide based on the 2026-05-02 session. Covers every issue encountered and how to fix it.

---

## Step 1: Prerequisites

```bash
node --version   # ≥ 18
which sqlite3    # must be on PATH (used by db:push workaround)
```

## Step 2: Fix the `.env` DATABASE_URL

The `.env` file may contain a Docker path that doesn't work locally.

```bash
# Check current value
grep DATABASE_URL .env

# If it shows a Docker path like:
#   DATABASE_URL="file:/srv/dev/moussawer/prisma/dev.db"
# Replace it with the local path:
sed -i 's|file:/srv/dev/moussawer/prisma/dev.db|file:./dev.db|' .env
```

> **Why:** Prisma resolves `file:./dev.db` relative to the `prisma/` directory (i.e., `prisma/dev.db`). A path like `file:./prisma/dev.db` would resolve to `prisma/prisma/dev.db` — wrong.

## Step 3: Install dependencies & reset database

```bash
npm install
npx prisma generate
npm run db:reset
```

Expected output:
```
Seeded Moussawer demo data
admin@example.com / password
photographer-one@example.com / password
client@example.com / password
```

> **Note:** `npm run db:push` doesn't use `prisma db push` (it's broken in this environment). Instead it generates SQL via `prisma migrate diff` and pipes it to `sqlite3`. This is handled automatically.

## Step 4: Build the frontend (if not already built)

```bash
npm run build
```

This creates `dist/index.html` + JS/CSS assets. The Express server serves from `dist/`.

## Step 5: Start the server

```bash
bash -c 'npx tsx server/index.ts &> /tmp/moussawer-api.log & disown'
```

Verify it's running:
```bash
curl -s http://localhost:4000/api/v1/me
# Should return 401 (no token) — meaning the server is alive

curl -s http://localhost:4000/
# Should return HTML with <title>Moussawer</title>
```

The server uses **port 4000** and serves both:
- The API at `/api/v1/*`
- The built frontend from `dist/` for all other routes (SPA fallback)

To stop the server:
```bash
lsof -ti :4000 | xargs kill
```

## Step 6: Fix the Playwright Chrome symlink

The Playwright MCP server looks for Chrome at `/opt/google/chrome/chrome`. That path is a symlink to `/tmp/playwright-browsers/...` which gets cleaned on reboot.

```bash
# Check if the symlink is broken
ls -la /opt/google/chrome/chrome

# If it's broken (target doesn't exist), recreate it:
mkdir -p /tmp/playwright-browsers/chromium-1217/chrome-linux64
ln -sf ~/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome \
  /tmp/playwright-browsers/chromium-1217/chrome-linux64/chrome
```

Verify Chrome is accessible:
```bash
/opt/google/chrome/chrome --version
# Should output: Google Chrome for Testing ...
```

## Step 7: Test in the browser with Playwright

### 7a. Verify the homepage loads

Navigate to `http://localhost:4000`. You should see the Moussawer landing page with navigation (Discover, Support, Log in, Join) and a hero section.

### 7b. Log in via API

```js
// In browser console or Playwright:
const res = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'client@example.com', password: 'password' })
});
const { data } = await res.json();
localStorage.setItem('moussawer_token', data.token);
// Now navigate to /dashboard
```

### 7c. Verify the dashboard

Navigate to `http://localhost:4000/dashboard`. As client Nadia, you should see:
- Metrics: Upcoming (2), Conversations (1), Open cases (2), Unread alerts (1)
- Bookings list with status badges (confirmed, pending, completed)
- Recent messages, Cases, Notifications
- **Your Profile** section at the bottom

### 7d. Test profile editing

Click the **Edit** button in the Your Profile section. Fill in new values and click **Save Profile**. The API endpoint is `PATCH /api/v1/me`.

Verify the update persisted:
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password"}' \
  | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).data.token")

curl -s http://localhost:4000/api/v1/me -H "Authorization: Bearer $TOKEN" \
  | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).data.clientProfile"
```

---

## Common Issues

### Browser shows stale content after `npm run build`

The browser caches JS/CSS with 304 Not Modified. Solution:
```bash
touch dist/index.html dist/assets/*.js dist/assets/*.css
```
Then hard-refresh the browser (Ctrl+Shift+R).

### Playwright "chrome not found" error

See Step 6 — the `/opt/google/chrome/chrome` symlink is broken.

### Playwright clicks don't work on React components

React's synthetic event system sometimes doesn't respond to Playwright's `page.click()`. Use native DOM events instead:

```js
// Click
await page.evaluate(() => {
  const btn = document.querySelector('button:has-text("Save")');
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

// Type into input
await page.evaluate(() => {
  const input = document.querySelector('input[placeholder="Name"]');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'New value');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
```

### Login with Playwright

Don't use the login form UI (flaky with React). Log in via API and set the token directly:

```js
await page.evaluate(async () => {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'client@example.com', password: 'password' })
  });
  const { data } = await res.json();
  localStorage.setItem('moussawer_token', data.token);
});
await page.goto('http://localhost:4000/dashboard');
```

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | password |
| Photographer | photographer-one@example.com | password |
| Photographer | photographer-two@example.com | password |
| Photographer | photographer-three@example.com | password |
| Client | client@example.com | password |

---

## Useful API endpoints for testing

| Endpoint | Method | Auth | Returns |
|---|---|---|---|
| `/api/v1/auth/login` | POST | No | `{ data: { token, user } }` |
| `/api/v1/auth/register` | POST | No | `{ data: { token, user } }` |
| `/api/v1/me` | GET | Yes | Current user with clientProfile/photographerProfile |
| `/api/v1/me` | PATCH | Yes | Update profile `{ name, avatarUrl, location, bio, phone }` |
| `/api/v1/photographers` | GET | No | List with filters, sort, pagination |
| `/api/v1/bookings` | GET | Yes | Current user's bookings |
| `/api/v1/conversations` | GET | Yes | Current user's conversations |
| `/api/v1/incidents` | GET | Yes | Current user's incidents |
| `/api/v1/disputes` | GET | Yes | Current user's disputes |
| `/api/v1/notifications` | GET | Yes | Current user's notifications |
