# Playwright MCP Server — Setup Guide for AI Agents

> **Purpose:** This document captures every mistake and fix encountered while installing and configuring the Playwright MCP server. If the MCP server is not working, start here.

---

## 1. Find the correct config file (first mistake)

**❌ Wrong:** I edited `/srv/dev/cline_mcp_settings.json`
**✅ Correct:** The real config is at:

```
/home/AyoubEtters/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**How to find it:** If you only have access to `/srv/dev`, ask the user to open the file or show you the contents of the Playwright MCP section.

---

## 2. The MCP server ID matters (second mistake)

**❌ Wrong:** I assumed the server ID was `github.com/microsoft/playwright-mcp`
**✅ Correct:** The actual server ID in the config is:

```json
"github.com/executeautomation/mcp-playwright": { ... }
```

The npm package used is `@playwright/mcp@latest` (Microsoft's Playwright MCP).

---

## 3. Chrome/Chromium must be installed (third mistake)

The Playwright MCP server needs a Chrome or Chromium browser at `/opt/google/chrome/chrome`.

**Do NOT try `--executable-path` alone** — it didn't work with this MCP server version (0.0.71).

### Working solution — install Chromium via Playwright:

```bash
# Download Chromium to a writable location
PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright-browsers npx playwright install chromium
```

This downloads Chromium to `/tmp/playwright-browsers/chromium-<version>/chrome-linux64/chrome`.

### Make it findable by the MCP server:

```bash
sudo mkdir -p /opt/google/chrome
sudo ln -sf /tmp/playwright-browsers/chromium-*/chrome-linux64/chrome /opt/google/chrome/chrome
```

---

## 4. MCP config must include `--browser chromium` + `--headless`

**❌ Wrong config (no flags):**
```json
"args": ["-y", "@playwright/mcp@latest"]
```

**❌ Wrong config (with --executable-path which didn't work):**
```json
"args": ["-y", "@playwright/mcp@latest", "--executable-path", "/path/to/chrome", "--headless"]
```

**✅ Correct config:**
```json
"args": [
  "-y",
  "@playwright/mcp@latest",
  "--browser",
  "chromium",
  "--headless"
]
```

The `--browser chromium` flag tells the MCP server to use Chromium (looks at `/opt/google/chrome/chrome`). Without it, it defaults to `chrome` which also looks at the same path, but specifying `chromium` is more explicit.

---

## 5. After changing config, restart is not always enough

Even after restarting Cline, old MCP processes may persist:

```bash
ps aux | grep playwright | grep -v grep
```

If you see processes **without** the expected args (e.g., just `npm exec @playwright/mcp@latest` without `--browser chromium --headless`), kill them:

```bash
kill <PID1> <PID2> <PID3>
```

Then ask the user to restart Cline so it spawns fresh processes with the correct args.

---

## 6. The `--executable-path` flag does NOT work reliably

Despite being listed in `--help`, the `--executable-path /path/to/chrome` flag was ignored by the Playwright MCP server v0.0.71. The server continued looking at `/opt/google/chrome/chrome`.

**Workaround:** Create a symlink at the default path instead of relying on `--executable-path`.

---

## 7. Users must start servers manually

You **cannot** reliably start a dev server in the background from a command tool — it times out.

**When you need a Vite dev server or Express API server running:**
1. Ask the user to start it
2. Provide the exact command
3. Wait for them to confirm it's running before testing

Example:
```
Please start the frontend dev server in a separate terminal:
cd /srv/dev/moussawer && npx vite --port 5173

Then start the backend API:
cd /srv/dev/moussawer && npx tsx server/index.ts
```

---

## 8. Summary — complete working setup

### Step 1: Install Chromium
```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright-browsers npx playwright install chromium
```

### Step 2: Create symlink
```bash
sudo mkdir -p /opt/google/chrome
sudo ln -sf /tmp/playwright-browsers/chromium-*/chrome-linux64/chrome /opt/google/chrome/chrome
```

### Step 3: Update MCP config
File: `/home/AyoubEtters/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
"github.com/executeautomation/mcp-playwright": {
  "autoApprove": ["browser_navigate", "browser_take_screenshot", "browser_snapshot", ...],
  "disabled": false,
  "timeout": 120,
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@playwright/mcp@latest",
    "--browser",
    "chromium",
    "--headless"
  ]
}
```

### Step 4: Restart Cline + verify
- Restart Cline
- Kill any leftover playwright processes
- Try: `browser_navigate` to `http://localhost:5173/`

### Step 5: Start servers
Ask user to start:
```bash
cd /srv/dev/moussawer
npx vite --port 5173           # frontend (terminal 1)
npx tsx server/index.ts        # backend  (terminal 2)
```
