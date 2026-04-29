# 🎯 AI Agent Task Backlog — Prioritized Execution Queue

> **Last Updated:** 2026-04-28
> **Strategy:** Tasks are ordered by **blocker/bug/infrastructure/feature/doc** priority.
> **Rule:** First task in this list = next task to execute. After completion, move it to `done/` and update this file.

---

## Priority Ordering Strategy

| Rank | Category     | Description                                                                 | Gate |
|------|-------------|-----------------------------------------------------------------------------|------|
| P0   | **Blockers** | Infrastructure issues that prevent agents from working on any other task    | Must fix first |
| P1   | **Bugs**    | Broken functionality actively affecting users or agents                     | Fix ASAP |
| P2   | **Tooling** | Automation, scripts, configs that make future work faster/cheaper           | High ROI |
| P3   | **Features**| New functionality (user-facing or agent-facing)                             | Value add |
| P4   | **Docs**    | Knowledge management, conventions, reflections                              | Knowledge retention |

**Execution rule:** An agent is not allowed to skip a P0 or P1 to work on P2-P4 unless the P0/P1 is blocked by an external dependency (e.g., waiting for user input).

---

## P0 — 🔴 Critical Blockers

### [P0-001] Fix Filesystem MCP allowed directories

| Field         | Value |
|---------------|-------|
| **Source**    | Note `a6c0627d`, `b7214016` |
| **Project**   | `global` |
| **Priority**  | 🔴 CRITICAL |
| **Status**    | ⏳ **NEXT TO EXECUTE** |

**Problem:** The Filesystem MCP server's allowed directories are restricted to `/srv/dev/moussawer` only. Projects under `/home/AyoubEtters/.cline/worktrees/` (SahabNote, etc.) cannot use `write_file`, `edit_file`, `directory_tree` etc. from the MCP server. Agents must fall back to `run_commands` + `cat` which is fragile.

**What to do:**
1. Locate the real MCP settings file at `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
2. Add `/home/AyoubEtters/.cline/worktrees/` to the `filesystem` server's `args` (the `-y` allowed directories flag)
3. Also add `/srv/dev/SahabNote` if not already present
4. Ask the user to restart Cline for changes to take effect

**Done when:** `list_allowed_directories` returns all project paths including worktrees.

---

## P1 — 🟠 Bugs

### [P1-001] Fix GitHub MCP authentication

| Field         | Value |
|---------------|-------|
| **Source**    | Note `e9c010e6` |
| **Project**   | `global` |
| **Priority**  | 🟠 HIGH |
| **Status**    | ⏳ Pending |

**Problem:** The GitHub MCP server (iflow-mcp/server-github) fails with "Authentication Failed" when trying to create PRs, merge, or write to repos. Agents fall back to `gh` CLI which works but has shell-escaping issues and the first attempt times out (needs 60s wait).

**What to do:**
1. Configure a GitHub PAT token (with `repo` scope) in the MCP server's env config
2. Verify by calling `list_pull_requests` or `create_issue`
3. Update `.clinerules` to document the fix and that MCP GitHub tools are now the primary path

**Done when:** GitHub MCP server can create branches, push files, and create PRs without auth errors.

---

### [P1-002] Fix SahabNote login & note creation bugs

| Field         | Value |
|---------------|-------|
| **Source**    | Note `878770f0` |
| **Project**   | `SahabNote` |
| **Priority**  | 🟠 HIGH |
| **Status**    | ⏳ Pending |
| **File**      | `/home/AyoubEtters/.cline/worktrees/*/SahabNote/android/src/App.js` |

**Problem:** After the login flow refactor, two bugs remain:
1. User notes don't load after successful login — `syncClient.current` may not have auth token set before `pullServerChanges()` is called
2. Creating a new note fails — `createNewNote` → `selectNote` → `saveCurrentNote` but `syncClient` has no server URL by default

**What to do:**
1. Investigate the `afterAuthSuccess()` flow in `App.js`
2. Verify `setAuthToken()` and `setServer()` are both called before `pullServerChanges()`
3. Check `createNewNote` flow for missing server URL in `syncClient`

**Done when:** User can log in and see their notes, and create new notes successfully.

---

### [P1-003] Add SPA fallback for production routing

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/production-spa-routing.md` |
| **Project**   | `moussawer` |
| **Priority**  | 🟠 HIGH |
| **Status**    | ⏳ Pending |

**Problem:** The production server serves the built frontend via `express.static("dist")` but lacks an SPA fallback route. Navigating directly to `/dashboard`, `/admin`, etc. returns 404 in production mode.

**What to do:**
1. Verify `server/app.ts` has the SPA fallback: `app.get("*", (req, res) => res.sendFile("dist/index.html", { root: __dirname }))`
2. Document the requirement in `.clinerules` or `server/README.md`
3. Add a test to the pre-deployment check if applicable

**Done when:** Direct navigation to client-side routes works in production mode.

---

## P2 — 🟡 Infrastructure & Tooling

### [P2-001] Create Git Automator MCP server

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/git-automation-mcp-server.md` |
| **Project**   | `global` |
| **Priority**  | 🟡 MEDIUM |
| **Status**    | ⏳ Pending |

**Problem:** Agents use 5+ shell commands for git operations (checkout, add, commit, push) then the GitHub MCP for PR creation. This fragile split fails on dirty repos, detached HEAD, and worktree branch conflicts.

**What to do:** Create an MCP server or enhanced wrapper that accepts a single intent:
```json
{
  "branch": "feat/my-feature",
  "message": "feat: add new feature",
  "files": ["src/Component.tsx"],
  "base": "main",
  "prTitle": "feat: add new feature",
  "prBody": "..."
}
```
And handles the full atomic flow via GitHub API (create_branch → push_files → create_pull_request).

**Done when:** A single MCP tool call can create a branch, push files, and open a PR.

---

### [P2-002] Add worktree port conflict resolution

| Field         | Value |
|---------------|-------|
| **Source**    | Note `7e4d4ddb` |
| **Project**   | `global` |
| **Priority**  | 🟡 MEDIUM |
| **Status**    | ⏳ Pending |

**Problem:** Running `npx expo start` or dev servers in a git worktree fails because another instance is already running from the main working directory. Causes confusion and wasted debugging.

**What to do:** Create a script or document a procedure to:
1. Detect conflicting processes by port
2. Offer to kill them or use alternative ports
3. Document in `.clinerules`

**Done when:** Agents can start dev servers in any worktree without port conflicts.

---

### [P2-003] Create pre-deployment validation script

| Field         | Value |
|---------------|-------|
| **Source**    | Note `38aa3c3f` (SahabNote) |
| **Project**   | `SahabNote` |
| **Priority**  | 🟡 MEDIUM |
| **Status**    | ⏳ Pending |
| **Reference** | Backend script: `backend/scripts/pre_deploy_check.py` |

**Problem:** No automated checks exist before deployment.

**What to do:**
1. Verify the pre-deploy script is functional
2. Create a similar check for moussawer if applicable
3. Document in `.clinerules`

**Done when:** Running the pre-deploy script confirms all 6 checks pass.

---

## P3 — 🟢 Features

### [P3-001] SahabNote admin interface (web-based)

| Field         | Value |
|---------------|-------|
| **Source**    | Note `76982d25` |
| **Project**   | `SahabNote` |
| **Priority**  | 🟢 MEDIUM |
| **Status**    | ⏳ Pending |

**Problem:** No admin interface exists for SahabNote to manage users and notes.

**What to do:** Create a web-based admin interface (or extend the existing backend API with a simple frontend) to list and manage registered users and their notes.

**Done when:** Admin can log in, view all users, view/edit notes, and manage accounts.

---

## P4 — 🔵 Documentation & Knowledge

### [P4-001] Document MCP settings file location

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/mcp-settings-location-documentation.md` |
| **Project**   | `global` |
| **Priority**  | 🔵 MEDIUM |
| **Status**    | ⏳ Pending |

**Problem:** The real Cline MCP settings file is at `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` but agents waste time editing stale copies in project roots.

**What to do:** Document the exact path in `.clinerules` or a central MCP reference doc.

---

### [P4-002] Document Playwright-React compatibility patterns

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/playwright-react-compatibility.md` |
| **Project**   | `global` |
| **Priority**  | 🔵 MEDIUM |
| **Status**    | ⏳ Pending |

**Problem:** Playwright `fill()` and `click()` don't consistently trigger React controlled component state. Agents waste 15+ minutes debugging.

**What to do:** Document workarounds in `.clinerules`:
- When `fill()` fails → use native value setter + `dispatchEvent(new Event("input", { bubbles: true }))` via `page.evaluate()`
- When `click()` fails on buttons with SVG children → use `document.querySelector(...).click()` via `page.evaluate()`
- Prefer `waitUntil: "load"` over `"networkidle"` for SPAs
- Prefer API login + token injection over UI form interaction

---

### [P4-003] Document wrapper scripts convention

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/wrapper-scripts-documentation.md` |
| **Project**   | `global` |
| **Priority**  | 🔵 LOW |
| **Status**    | ⏳ Pending |

**Problem:** MCP servers use wrapper scripts in `~/.local/bin/` but this is undocumented. Agents may try direct `npx` calls and fail.

**What to do:** List all wrapper script locations in `.clinerules`.

---

### [P4-004] Fix misleading CLINE.md documentation

| Field         | Value |
|---------------|-------|
| **Source**    | Note `fbbb9d1b` |
| **Project**   | `SahabNote` |
| **Priority**  | 🔵 MEDIUM |
| **Status**    | ⏳ Pending |
| **File**      | `CLINE.md` (on main branch of SahabNote) |

**Problem:** CLINE.md claims "This file is loaded by the AI agent" but Cline does NOT auto-load CLINE.md — it loads `.clinerules`. This misleads future agents.

**What to do:** Either remove CLINE.md or update it to clarify it's a reference doc, not auto-loaded.

---

### [P4-005] Document ESLint v10 flat config & workflow lessons

| Field         | Value |
|---------------|-------|
| **Source**    | Note `f5582116` |
| **Project**   | `global` |
| **Priority**  | 🔵 HIGH |
| **Status**    | ⏳ Pending |

**Problem:** Lessons learned from ESLint/Prettier setup pain:
1. ESLint v10 drops `.eslintrc.cjs` — requires flat config (`eslint.config.js`)
2. The `editor` tool corrupts indentation in Vue/HTML — always run `prettier --write` after
3. Prefer `git stash → pull --rebase → stash pop` over `format-patch + reset --hard + am`
4. Prettier removes `eslint-disable-next-line` comments — verify after formatting
5. Self-closing void elements (`<input/>`) trigger vue3-recommended warnings — disable rule

**What to do:** Add these to `.clinerules` under a "Lessons Learned" section.

---

### [P4-006] Add pre-commit hooks & branch naming convention

| Field         | Value |
|---------------|-------|
| **Source**    | Note `1c545c42` |
| **Project**   | `global` |
| **Priority**  | 🔵 LOW |
| **Status**    | ⏳ Pending |

**Problem:** No automated quality gates or naming conventions documented.

**What to do:**
1. Add pre-commit hooks with build check (husky/lint-staged or simple grep)
2. Document branch naming convention: `type/description` (fix/, feat/, chore/, docs/, refactor/)
3. Document that incident reports should be committed to the same branch as the fix

---

## 📋 Completed Tasks Archive

Tasks moved here are **done**. See `doc/ai-improvement-tasks/done/` for details.

| # | Task | Date Completed |
|---|------|---------------|
| 1 | Kill Playwright MCP zombie processes script | 2026-04-28 |
| 2 | Dev server automation (Dockerfile + docker-compose.yml) | 2026-04-28 |
| 3 | Moussawer Admin interface (`/admin` route + page) | 2026-04-28 |
| 4 | Playwright MCP configuration fix (upgrade to official) | 2026-04-28 |
| 5 | RequireRole component + route guard refactor | 2026-04-28 |
| 6 | SahabNote Expo SDK 50 → 54 upgrade | 2026-04-26 |
| 7 | SahabNote Android UI two-screen redesign | 2026-04-27 |
| 8 | Project-level CLINE.md for SahabNote | 2026-04-26 |
| 9 | Pre-deployment validation script (SahabNote) | 2026-04-26 |
| 10 | Playwright smoke test script | 2026-04-28 |

---

## 🔄 Agent Execution Workflow

When you (the AI agent) start a session:

1. **Read this file** — identify the first task with status `⏳ NEXT TO EXECUTE` or `⏳ Pending`
2. **Execute the task** — follow the "What to do" instructions
3. **On completion:**
   - Move the task's detail file from `backlog/` to `done/` (create one if missing)
   - Move the task row from its priority section to the **Completed Tasks Archive** table
   - Change status to `✅ Done` and add completion date
   - If a corresponding moudakkir note exists, update its status to `accepted`
4. **Update this file** — so the next agent knows where to start
5. **Proceed to the next task** in list order
