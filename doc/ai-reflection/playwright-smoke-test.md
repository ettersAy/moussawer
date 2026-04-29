# Reflection: Playwright Smoke Test

## Time Wasters

- Multiple failed attempts to start dev server via background shell commands (background processes killed by command timeout). Lost ~10 min.
- Debugging Playwright `fill()` not triggering React controlled inputs — wasted ~15 min on form interaction before switching to direct API login.
- Debugging Playwright `click()` not triggering React onClick for buttons with SVG children — wasted ~5 min.
- `waitUntil: "networkidle"` caused repeated timeouts with SPA — switched to `"load"`.
- Smoke test timed out 3× due to cumulative wait times exceeding 30s tool limit — needed aggressive wait reduction.

## Hard to Find

- The Docker container (`docker-compose.yml`) was defined but not mentioned in `.clinerules` or available reflection docs as a test target — had to discover independently.
- Project exists in two locations (`~/.cline/worktrees/2a8c4/moussawer` and `/srv/dev/moussawer`) with different file permission rules — caused confusion when copying files between them.
- Production server lacks SPA fallback — not documented anywhere, discovered only after Playwright returned 404 on `/login`.
- LoginPage has hardcoded demo credentials in `useState` defaults — not mentioned in any doc, caused confusion when `fill()` didn't override them.

## Assumptions Wrong

- Assumed `fill()` works with React controlled components — it doesn't always trigger `onChange` properly.
- Assumed `click()` on a button with SVG children works — Playwright's synthetic click doesn't bubble to React's delegation in some cases.
- Assumed `waitUntil: "networkidle"` was safe for SPAs — causes timeouts due to long-lived XHR polling.
- Assumed production server (`tsx server/index.ts`) handles client-side routing — it doesn't without the SPA fallback.

## Repeated Searches

- Checked server port availability 5+ times during debugging.
- Checked browser console errors 4+ times.
- Checked page snapshots 7+ times.
- Read LoginPage.tsx component 3 times.

## .clinerules Gaps

- No documented pattern for how to run production server for smoke tests.
- No mention that Playwright `fill()` may not work with React controlled inputs.
- No mention of the two-repository-location issue (worktree vs /srv/dev).
- No mention that production mode needs the SPA fallback.

## Automation Wins

- `scripts/smoke-test.sh` created — single-command startup for test environment.
- Smoke test itself (`tests/smoke-test.js`) replaces 6+ manual browser steps with 1 call.
