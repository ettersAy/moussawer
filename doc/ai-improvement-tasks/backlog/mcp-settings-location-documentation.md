# Problem
Two `cline_mcp_settings.json` files exist — one for the VS Code Cline extension and another for the CLI/kanban Cline. AI agents must guess which file to edit, and often waste time editing the wrong one.

- VS Code extension: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- CLI/kanban: `~/.cline/data/settings/cline_mcp_settings.json`

Additionally, the CLI/kanban version does not support the `env` field in MCP config entries — wrappers must be used instead. This is another hidden convention that slows down MCP server setup.

# Improvement Needed
Document both config file locations and their differences (supported features, wrapper requirements) in `.clinerules` and a dedicated doc file.

# Expected Result
Future AI agents should know immediately which config file to edit and how to properly configure an MCP server for each Cline version, without trial and error.
