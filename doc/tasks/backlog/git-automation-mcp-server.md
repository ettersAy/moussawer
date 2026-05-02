# ~~Problem~~ - DONE

> Implemented: 2026-04-29
> See `doc/git-automation-mcp-server.md` for full documentation.

## Original Problem
AI agents currently use raw shell commands (`git checkout -b`, `git add`, `git commit`, `git push`) for git operations, then the GitHub MCP server (`create_pull_request`) for PR creation. This split between shell and MCP tools is fragile — shell commands can fail due to local repo state (dirty tree, detached HEAD, auth issues), and the agent must manually manage the sequence.

For this specific project, `gh` CLI is installed, which makes the full flow possible from a single script (`scripts/git-automate.sh`). But the AI agent still has to remember to:
1. Run the script with correct arguments
2. Parse the output
3. Handle failures

# Improvement Needed
Create a **Git Automator MCP server** (or enhance the existing GitHub MCP server) that accepts a single intent:
```
{
  "branch": "feat/my-feature",
  "message": "feat: add new feature",
  "files": ["src/Component.tsx", "src/lib/utils.ts"],
  "base": "main",
  "prTitle": "feat: add new feature",
  "prBody": "..."
}
```
And handles the full flow atomically:
- Creates the branch (via GitHub API, not local git)
- Reads file contents and pushes them via `push_files` API
- Creates the PR

This eliminates dependency on local git state, shell commands, and multi-step orchestration by the AI agent.

# Expected Result
- AI agents push and create PRs with a **single MCP tool call** instead of 5+ shell commands
- No failures due to dirty local repo, detached HEAD, or uncommitted changes
- Works regardless of the local clone state — reads files from filesystem, pushes directly to GitHub
- The `scripts/git-automate.sh` script remains as a fallback for manual/terminal use

# Implementation Notes (for reference, not requirements)
- Use `github.com/iflow-mcp/server-github` tools (`create_branch`, `push_files`, `create_pull_request`) as building blocks
- Read file contents via filesystem MCP, then pass to `push_files`
- No need for a new npm package — can be a simple wrapper script or an additional MCP server entry in `cline_mcp_settings.json`
