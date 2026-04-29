# Reflection — Admin Route Dedup + Playwright MCP Setup

## Time wasted

- **~30 minutes** editing the wrong MCP config file at `/srv/dev/cline_mcp_settings.json` while the real one was under `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/`
- **~15 minutes** trying `--executable-path` flag that didn't work instead of creating a symlink
- **~10 minutes** killing zombie Playwright MCP processes after each restart that persisted with old args
- **~10 minutes** background process timeouts trying to start servers myself instead of asking the user

## Information that was difficult to find

- The real Cline MCP settings file location — not in the project directory, not listed in `.clinerules`
- The MCP server ID (`github.com/executeautomation/mcp-playwright`) — different from the npm package name `@playwright/mcp`
- Chrome not installed system-wide, no documented location for Playwright browser binaries

## Repeated searches

- `ps aux | grep playwright` — ran 4+ times to find zombie processes
- `browser_navigate` error messages — read the same "not found at /opt/google/chrome/chrome" error 8+ times
- Grepping `--help` output of `@playwright/mcp` to check flag availability

## Incorrect assumptions

- Assumed `--executable-path` would override the default Chrome path (it didn't)
- Assumed restarting Cline kills old MCP processes (it doesn't — zombies persist)
- Assumed the MCP config in the project directory was the real one (it was a stale copy)

## Missing project knowledge that should have been documented earlier

- No documentation existed about how the Playwright MCP was initially installed or configured
- No record of the correct MCP settings file path
- No browser installation notes for the development environment

## `.clinerules` improvements made

- Added Playwright validation as required workflow step (was just "manual verification if needed")
- Added lazy-load rules to avoid loading setup/testing docs at mission start
- Added rule: ask user for server startup instead of background processes
- Added rule: do NOT push until structured testing checklist passes

## Hidden conventions discovered

- MCP servers use wrapper scripts located in `~/.local/bin/` not direct npm commands
- The filesystem MCP server is a wrapper shell script, not a direct npx call
- GitHub and Moudakkir servers are Node.js wrapper scripts

## Automation opportunities

- MCP process health check: a script to kill stale Playwright processes before restarting
- Server readiness check: asking the user to start servers is manual friction; a docker-compose or PM2 config could manage both frontend and backend
- Validation smoke test script: a Playwright script that automates the 6-test checklist
