# AI Reflection — MCP Wrapper Scripts Convention Documentation

## Discovery Waste

- **Wrapper scripts outside allowed directories:** `~/.local/bin/` is not in the filesystem MCP's allowed directories list, so `read_files` failed. Had to fall back to `run_commands` + `cat` to inspect wrapper scripts. The same limitation affects any future AI agent trying to read these files.
- **editor tool insert_line miscalculation:** Using `insert_line` required manually counting existing lines. Got the line wrong on first attempt, which split a code block and corrupted `.clinerules` structure. Required 3 additional edit operations to fix. Content-based `old_text`/`new_text` replacement is safer for large files.
- **Wrapper convention was known but undocumented:** The MCP config referenced `~/.local/bin/` wrappers directly, but no single doc explained the pattern. Had to infer the convention by reading all wrapper scripts individually.

## Missing `.clinerules` Knowledge

- Now documented: the wrapper scripts convention (this mission's output).
- Still missing: a list of which directories are available in the filesystem MCP allowed directories — AI agents currently discover this only by calling `list_allowed_directories` at runtime.

## Automation Opportunities

- **Wrapper script listing helper:** A simple command or script that lists all MCP wrapper scripts in `~/.local/bin/` with their corresponding MCP servers and purposes would remove the need to scan the MCP config and wrapper files manually. This is essentially what the new `.clinerules` section provides.
- **editor tool usage note:** When editing large `.clinerules`, prefer `old_text`/`new_text` replacement over `insert_line` to avoid structural corruption. Insert line numbers are fragile.

## Documented

- `.clinerules` — new "MCP Server Wrapper Scripts Convention" section added.
- PR #70 pushed with changes.
