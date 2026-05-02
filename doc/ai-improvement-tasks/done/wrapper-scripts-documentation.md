# Problem
Several MCP servers use wrapper scripts in `~/.local/bin/` (filesystem is a bash wrapper, github and moudakkir are Node.js wrappers), but this convention is undocumented. AI agents may attempt direct `npx` calls and fail, or waste time understanding the wrapper logic.

# Improvement Needed
Document the wrapper script convention and list all wrapper script locations in `.clinerules` or a central MCP reference doc.

# Expected Result
AI agents immediately know to look for wrapper scripts in `~/.local/bin/` instead of trying to reverse-engineer how each MCP server starts.
