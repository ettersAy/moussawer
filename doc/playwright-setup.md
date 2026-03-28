# 🎭 Playwright Setup & How to Run Tests

## Why Two Environments Matter

This project runs code in **two distinct environments**. Understanding the difference is key to running Playwright correctly.

| Environment | Where it runs | Accesses the web via |
| --- | --- | --- |
| **Docker / Sail container** | Inside Docker | Internal Docker network |
| **Your host machine (Linux Mint)** | Your terminal directly | Your real browser, your display server (X11) |

Playwright **must run on the host machine** for interactive (`--ui`, `--headed`, `--debug`) tests, because those modes require a graphical display (X Server / GUI), which Docker containers do not have.

---

## 🏗️ Architecture of This Setup

```
Host machine (Linux Mint)
 ├── Playwright (installed in node_modules on the host)
 ├── Chromium (downloaded by Playwright to ~/.cache/ms-playwright/)
 └── Runs tests → hits http://localhost → reaches Docker container

Docker container (Sail)
 ├── Laravel (PHP, port 80 → host port 80)
 ├── Vite dev server (port 5173 → host port 5173)
 └── MySQL (port 3306)
```

Playwright acts as a **real browser user** on your host machine. It opens a browser that sends HTTP requests to `http://localhost`, which Docker forwards to the Laravel container.

---

## 🔌 Why `http://localhost` (Not `:8000`)

Check `compose.yaml` line 12:

```yaml
ports:
  - '${APP_PORT:-80}:80'
```

Since `APP_PORT` is **not set** in your `.env`, Sail binds to port **80** by default. Port 80 is the HTTP default, so no port suffix is needed.

```
http://localhost      # ✅ Correct (port 80)
http://localhost:80   # ✅ Also correct (explicit)
http://localhost:8000 # ❌ Wrong — nothing is listening on 8000
```

> **If you ever add `APP_PORT=8000` to your `.env`**, update `playwright.config.js` `baseURL` to `http://localhost:8000` and restart Sail.

The `PLAYWRIGHT_BASE_URL` env var can always override the default:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:8000 npm run test:e2e
```

---

## 📦 Installing Playwright Browsers

Playwright requires its own browser binaries. These must be installed **on the host machine**, because Playwright runs on the host.

```bash
# ✅ Correct — run on the HOST (your regular terminal)
npx playwright install chromium
npx playwright install chromium --with-deps   # Also installs OS-level dependencies

# ❌ Wrong — installs inside Docker, which can't display a GUI
./vendor/bin/sail npx playwright install chromium
```

Browsers are downloaded to `~/.cache/ms-playwright/` on your host machine.

> Running `./vendor/bin/sail npm run test:e2e` for **headless** (non-UI) tests technically works because Node.js doesn't need a display, and it can reach the host Chromium via volume mounts. But always running from the host is simpler and avoids confusion.

---

## ▶️ Running Tests — The Complete Reference

### Prerequisites (every time)

Both servers must be running before any Playwright test:

```bash
# Terminal 1 — Backend (Laravel + MySQL)
./vendor/bin/sail up -d

# Terminal 2 — Frontend (Vite HMR dev server)
npm run dev
```

---

### 🟢 Commands to run FROM THE HOST

| Command | What it does |
| --- | --- |
| `npm run test:e2e` | Run all tests, headless Chromium |
| `npm run test:e2e:ui` | Open Playwright interactive UI mode |
| `npm run test:e2e:report` | Open the last HTML test report |
| `npx playwright test contact` | Run only tests matching "contact" |
| `npx playwright test --headed` | Run with a visible browser window |
| `npx playwright test --debug` | Playwright inspector (step-by-step) |
| `npx playwright test --list` | List all tests without running them |

---

### 🟡 Commands you CAN run inside Sail (headless only)

```bash
./vendor/bin/sail npm run test:e2e    # ✅ Headless only
```

---

### 🔴 Commands that MUST run on the host (require X Server)

```bash
npm run test:e2e:ui          # ❌ Fails in container (no display)
npx playwright test --headed # ❌ Fails in container
npx playwright test --debug  # ❌ Fails in container
```

The error you see when you try inside Docker:

```
Looks like you launched a headed browser without having a XServer running.
```

This is expected. The fix is simply to run from your host terminal.

---

## 🗂️ Project File Structure

```
e2e/
├── fixtures/
│   └── index.js           # Custom fixtures (inject Page Objects into tests)
├── pages/
│   └── ContactPage.js     # Page Object Model for /contact
├── contact/
│   └── contact.spec.js    # E2E tests for the contact page
└── reports/html/          # Generated HTML reports (git-ignored)

playwright.config.js       # Config at project root
```

---

## 🔍 Checking Which Port Your App Is On

```bash
# See all container port bindings
docker ps

# Check what APP_PORT is set to
grep APP_PORT .env compose.yaml
```
