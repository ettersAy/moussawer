# 🎯 AI Agent Task Backlog — Prioritized Execution Queue

> **Last Updated:** 2026-04-29
> **Strategy:** Tasks are grouped into **thematic buckets** and ordered by **blocker/bug/infrastructure/feature/doc** priority.
> **Rule:** First task in this list = **NEXT TO EXECUTE**. After completion, move it to `done/` and update this file.

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

### [P0-001] Fix MCP Infrastructure (Filesystem + GitHub auth)

| Field         | Value |
|---------------|-------|
| **Source**    | Notes `a6c0627d`, `b7214016`, `e9c010e6` |
| **Project**   | `global` |
| **Priority**  | 🔴 CRITICAL |
| **Status**    | ⏳ **NEXT TO EXECUTE** |

**What's included (grouped):**
1. **Fix Filesystem MCP allowed directories** — The Filesystem MCP server's allowed directories are restricted to `/srv/dev/moussawer` only. Projects under `/home/AyoubEtters/.cline/worktrees/` cannot use `write_file`, `edit_file`, `directory_tree` etc.
2. **Fix GitHub MCP authentication** — The GitHub MCP server (`iflow-mcp/server-github`) fails with "Authentication Failed" when creating PRs, merging, or writing to repos.

**Why grouped:** Both are MCP server configuration issues that block ALL agent work across all projects. Fixing them together minimizes restarts of the Cline extension.

**What to do:**
1. Locate the real MCP settings file at `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
2. **Filesystem fix:** Add `/home/AyoubEtters/.cline/worktrees/` and `/srv/dev/SahabNote` to the `filesystem` server's `-y` allowed directories flag
3. **GitHub fix:** Configure a GitHub PAT token (with `repo` scope) in the GitHub MCP server's `env` config
4. Ask the user to restart Cline for changes to take effect
5. Update `.clinerules` to document both fixes

**Done when:**
- `list_allowed_directories` returns all project paths including worktrees
- GitHub MCP server can create branches, push files, and create PRs without auth errors

---

## P1 — 🟠 Bugs

### [P1-001] Fix SahabNote login, notes & CLINE.md

| Field         | Value |
|---------------|-------|
| **Source**    | Notes `878770f0`, `fbbb9d1b` |
| **Project**   | `SahabNote` |
| **Priority**  | 🟠 HIGH |
| **Status**    | ⏳ Pending |
| **File**      | `/home/AyoubEtters/.cline/worktrees/*/SahabNote/android/src/App.js`, `CLINE.md` (main branch) |

**What's included (grouped):**
1. **Fix login & note creation bugs** — After login flow refactor: (a) user notes don't load — `syncClient.current` may not have auth token before `pullServerChanges()` is called; (b) creating a new note fails — `syncClient` has no server URL by default.
2. **Fix misleading CLINE.md documentation** — CLINE.md claims "This file is loaded by the AI agent" but Cline does NOT auto-load CLINE.md — it loads `.clinerules`. This misleads future agents.

**Why grouped:** Both are SahabNote-specific fixes affecting the same codebase. An agent working on SahabNote should fix these together.

**What to do:**
1. Investigate the `afterAuthSuccess()` flow in `App.js`
2. Verify `setAuthToken()` and `setServer()` are both called before `pullServerChanges()`
3. Check `createNewNote` flow for missing server URL in `syncClient`
4. Either remove CLINE.md or update it to clarify it's a reference doc, not auto-loaded

**Done when:** User can log in and see their notes; create new notes successfully; CLINE.md is no longer misleading.

---

### [P1-002] Add SPA fallback for production routing

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

### [P2-001] Build Dev Tooling Suite

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/git-automation-mcp-server.md`, Note `7e4d4ddb`, Note `38aa3c3f`, Note `1c545c42` |
| **Project**   | `global` (some sub-items for `SahabNote`) |
| **Priority**  | 🟡 MEDIUM |
| **Status**    | ⏳ Pending |

**What's included (grouped):**

| # | Sub-task | Source | Description |
|---|----------|--------|-------------|
| 1 | **Git Automator MCP server** | `backlog/git-automation-mcp-server.md` | Single MCP tool call to create branch, push files, and open a PR — eliminates fragile shell command chains |
| 2 | **Worktree port conflict resolution** | Note `7e4d4ddb` | Script/procedure to detect & resolve port conflicts when running dev servers in git worktrees |
| 3 | **Pre-deployment validation script** | Note `38aa3c3f` | Verify/complete the pre-deploy check for SahabNote; create equivalent for moussawer |
| 4 | **Quality gates & conventions** | Note `1c545c42` | Pre-commit hooks with build check + documented branch naming convention (`fix/`, `feat/`, `chore/`, `docs/`, `refactor/`) |

**Why grouped:** These are all "tooling that makes developer/agent workflow faster and safer." They belong to a single execution phase after critical bugs are fixed.

**What to do — in order:**

1. **Git Automator:** Create an MCP server or wrapper script using GitHub API (`create_branch` → `push_files` → `create_pull_request`) that accepts a single intent JSON
2. **Port conflicts:** Create a script that detects conflicting processes by port and offers to kill them or use alternatives; document in `.clinerules`
3. **Pre-deployment:** Verify `backend/scripts/pre_deploy_check.py` works for SahabNote; create equivalent for moussawer
4. **Quality gates:** Add pre-commit hooks (husky/lint-staged or simple grep), document branch naming convention, document that incident reports go on the same branch as the fix

**Done when:** All 4 sub-tasks are complete — agents can: (1) push+PR in one call, (2) start servers without port conflicts, (3) run pre-deploy checks, (4) use consistent branch naming.

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

### [P4-001] Consolidate .clinerules Knowledge Base

| Field         | Value |
|---------------|-------|
| **Source**    | `doc/ai-improvement-tasks/backlog/mcp-settings-location-documentation.md`, `backlog/playwright-react-compatibility.md`, `backlog/wrapper-scripts-documentation.md`, Note `f5582116` |
| **Project**   | `global` |
| **Priority**  | 🔵 MEDIUM |
| **Status**    | ⏳ Pending |

**What's included (grouped):**

| # | Knowledge Item | Source | Description |
|---|---------------|--------|-------------|
| 1 | **MCP settings file location** | `backlog/mcp-settings-location-documentation.md` | Document that real MCP config is at `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` — not project-root copies |
| 2 | **Playwright-React compatibility patterns** | `backlog/playwright-react-compatibility.md` | When `fill()`/`click()` fail on React controlled components → use `page.evaluate()` with native events. Prefer `waitUntil: "load"` over `"networkidle"` for SPAs |
| 3 | **Wrapper scripts convention** ~~`backlog/wrapper-scripts-documentation.md`~~ ✅ **DONE** (PR #70) | `done/wrapper-scripts-documentation.md` | List all wrapper script locations in `~/.local/bin/` used by MCP servers |
| 4 | **ESLint v10 & workflow lessons** | Note `f5582116` | ESLint v10 requires flat config; `editor` tool corrupts indentation → run `prettier --write` after; prefer `git stash → pull --rebase → stash pop`; Prettier removes `eslint-disable` comments |

**Why grouped:** All are "add to `.clinerules`" documentation tasks. An agent can batch-edit `.clinerules` once with all these lessons, rather than making 4 separate passes.

**What to do:**
1. Open `.clinerules` (project-level or global)
2. Add a **"Lessons Learned & Conventions"** section containing all 4 knowledge items
3. Ensure each item has a clear, actionable pattern (not just a problem statement)

**Done when:** `.clinerules` contains all 4 documented patterns in a single, well-organized section.

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
2. **Execute the task** — follow the "What to do" instructions. If the task is grouped, complete ALL sub-tasks before marking it done.
3. **On completion:**
   - Move any relevant detail files from `backlog/` to `done/`
   - Move the task row from its priority section to the **Completed Tasks Archive** table
   - Change status to `✅ Done` and add completion date
   - If a corresponding moudakkir note exists, update its status to `accepted`
4. **Update this file** — so the next agent knows where to start
5. **Proceed to the next task** in list order
