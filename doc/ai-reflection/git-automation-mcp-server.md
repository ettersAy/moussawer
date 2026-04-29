# AI Reflection — Git Automator MCP Server

## Discovery Waste

- **Wrong MCP config file:** Spent ~10min editing the VS Code extension settings file (`~/.config/Code/User/...`) instead of the CLI/kanban one (`~/.cline/data/settings/...`). Both files exist with similar contents but serve different Cline instances.
- **Global module resolution:** `@modelcontextprotocol/sdk` wasn't at the top-level global `node_modules` — it was nested under `kanban` and `@executeautomation/playwright-mcp-server`. Required installing it globally AND setting `NODE_PATH` in the wrapper. The `npm list -g` output showing it as a "deduped" dependency was misleading.
- **MCP protocol testing:** First `tools/call` test failed silently because the MCP initialize handshake must precede tool calls. Had to craft the JSON-RPC sequence manually.
- **Wrapper pattern discovery:** Had to read the github-mcp-wrapper.js to understand the project's MCP wrapper pattern. The `env` field in `cline_mcp_settings.json` is not used by the CLI/kanban version — wrappers set env vars instead.

## Missing `.clinerules` Knowledge

- Should document that **two Cline MCP config files exist** and which one each Cline version uses (VS Code extension vs CLI/kanban).
- Should document the **wrapper pattern** convention — all MCP servers use wrapper scripts that inject env vars, not the `env` field in settings JSON.
- Should document that `@modelcontextprotocol/sdk` may need a global install + `NODE_PATH` for standalone MCP scripts.

## Automation Opportunities

- Token is hardcoded in `github-mcp-wrapper.js` — a token leakage risk. Should use env var or a secure vault.
- MCP server smoke test script: a simple script that sends `initialize` + `tools/list` to verify an MCP server is healthy after config changes.
- No validation for MCP config syntax before restarting Cline — a config validator script would catch `env`-vs-wrapper mismatches.

## Documented

- `doc/git-automation-mcp-server.md` — full documentation for the new MCP server.
- PR #68 pushed with all changes, already merged.
