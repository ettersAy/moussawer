# Problem
Playwright browser-based testing failed because the Chrome symlink at `/opt/google/chrome/chrome` pointed to `/tmp/playwright-browsers/` which was cleaned up. The MCP server had no fallback to the multiple chromium installations in `~/.cache/ms-playwright/`. 20 minutes were wasted diagnosing and attempting fixes without sudo.

# Improvement Needed
Document the Playwright MCP browser setup requirement in project settings: ensure the MCP server's browser path points to a persistent location or use the `PLAYWRIGHT_BROWSERS_PATH` environment variable. Add a pre-flight check that verifies the browser binary exists before attempting UI tests.

# Expected Result
Future AI agents verify browser availability in 5 seconds instead of 20 minutes of trial-and-error.
