# Problem
The real Cline MCP settings file location is outside the project directory and undocumented. AI agents waste time editing stale config copies in the project root while the real file under `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/` remains unchanged.

# Improvement Needed
Document the correct MCP settings file path in `.clinerules` or a dedicated config reference doc.

# Expected Result
Future AI agents find and edit the correct config file on the first attempt instead of discovering it through trial and error.
