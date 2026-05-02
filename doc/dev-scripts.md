# Developer Scripts Reference

## `scripts/dev-server.sh`

**Purpose:** Start the Moussawer API server in one command. Eliminates the trial-and-error of background process management.

**Usage:**
```bash
./scripts/dev-server.sh        # default port 4000
./scripts/dev-server.sh 4001   # custom port
```

**What it does:**
1. Kills any existing process on the target port
2. Starts the Express API server in background (`node --import tsx server/index.ts`)
3. Waits 3 seconds for startup
4. Verifies the server is healthy via `GET /api/v1/health`
5. Prints success/failure with clear output

**When to use:**
- At the start of any mission that requires a running API server
- After restarting the machine or killing stale processes
- Before running Playwright tests or manual browser validation

**Why it exists:**
The `run_commands` tool has a 30-second timeout. Background processes (`&`) inherited file descriptors cause the tool to hang waiting for them to close. Attempting to chain background commands with `&&` or `;` always times out. This script encapsulates the working pattern: separate the background process from verification into distinct steps.

**Before (broken — always times out):**
```
npm run dev:api > /tmp/log 2>&1 &    # times out after 30s
```

**After (works reliably):**
```
./scripts/dev-server.sh              # completes in ~4s
```

---

## `scripts/check-quality.sh`

**Purpose:** Run all quality gates in one command: lint → type check → build.

**Usage:**
```bash
./scripts/check-quality.sh
```

**What it does:**
1. Runs ESLint on all source files (max 5 warnings allowed)
2. Runs TypeScript type check + Vite production build (`npm run build`)
3. Exits with code 0 only if both pass

**When to use:**
- After completing a feature or set of file edits
- Before declaring any phase complete
- Before committing

**Why it exists:**
Running lint and build separately is repetitive and easy to forget. Running them late (only at commit time) caused 24 issues to pile up, requiring 15 minutes of fixes. This script makes quality checking a single, quick command.

---

## `scripts/smoke-test.sh`

**Purpose:** Start server, verify health, and output instructions for running the Playwright smoke test.

**Usage:**
```bash
./scripts/smoke-test.sh
```

**What it does:**
1. Seeds the database (`npm run db:reset`)
2. Builds frontend if `dist/` is missing
3. Starts the API server
4. Verifies the server responds
5. Prints instructions for running the Playwright smoke test
6. Keeps the server running until Ctrl+C

**When to use:**
- Before running the full Playwright smoke test suite
- After database schema changes

---

## `scripts/kill-playwright-mcp.sh`

**Purpose:** Kill all stale Playwright MCP processes that persist after Cline restarts.

**Usage:**
```bash
./scripts/kill-playwright-mcp.sh
```

**When to use:**
- When Playwright MCP server fails to initialize
- At the start of any session involving browser automation
- After Cline restarts

---

## Script Discovery

All utility scripts live in `scripts/` with descriptive names. Future AI agents should:

1. Read this document (`doc/dev-scripts.md`) when starting development work
2. Check `scripts/` for available automation before writing new commands
3. Use `scripts/dev-server.sh` instead of attempting manual server startup
4. Use `scripts/check-quality.sh` before declaring any phase complete
