# Git Automator MCP Server

## What Changed

Created a new MCP server (`git-automate-mcp`) that exposes a single `git_automate` tool to atomically create branches, push files, and create Pull Requests — all via the GitHub API without touching the local git state.

## Why

Previously, AI agents had to orchestrate 5+ shell commands (`git checkout -b`, `git add`, `git commit`, `git push`, `gh pr create`) or rely on `scripts/git-automate.sh`. Both approaches depend on local git state, which is fragile — dirty trees, detached HEAD, uncommitted changes, and auth issues all cause failures.

The new MCP tool eliminates these failure modes by:
- Reading file contents directly from the filesystem (no local git staging needed)
- Creating branches via GitHub API (not local `git checkout`)
- Pushing files via Git Data API (blobs → tree → commit → ref) — single commit per call
- Creating/updating PRs via `gh pr create`/`gh pr edit`

## Before vs After

### Before (5+ shell commands or script orchestration):
```bash
./scripts/git-automate.sh feat/my-feature "feat: add feature" src/file.tsx
# Or manually:
git checkout -b feat/my-feature
git add src/file.tsx
git commit -m "feat: add feature"
git push -u origin feat/my-feature
gh pr create --base main --head feat/my-feature --title "feat: add feature" --body "..."
```

### After (single MCP tool call):
```
git_automate({
  branch: "feat/my-feature",
  message: "feat: add feature",
  files: ["src/file.tsx"],
  base: "main",
  prTitle: "feat: add feature"
})
```

## Setup

The server is registered in `cline_mcp_settings.json` at:
```
~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### MCP Config Entry

```json
"github.com/iflow-mcp/git-automate-mcp": {
  "autoApprove": ["git_automate"],
  "disabled": false,
  "timeout": 60,
  "type": "stdio",
  "command": "node",
  "args": ["/home/AyoubEtters/.local/bin/git-automate-mcp.js"],
  "env": {
    "GITHUB_TOKEN": "ghp_...",
    "GITHUB_OWNER": "ettersAy",
    "GITHUB_REPO": "moussawer",
    "PROJECT_ROOT": "/home/AyoubEtters/.cline/worktrees/4cf8b/moussawer"
  }
}
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | GitHub personal access token with repo scope |
| `GITHUB_OWNER` | Yes | Repository owner (e.g., `ettersAy`) |
| `GITHUB_REPO` | Yes | Repository name (e.g., `moussawer`) |
| `PROJECT_ROOT` | Yes | Absolute path to the local checkout (for reading files) |

## Tool: `git_automate`

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `branch` | string | Yes | — | Branch name to create (e.g., `feat/my-feature`) |
| `message` | string | Yes | — | Commit message (e.g., `feat: add new feature`) |
| `files` | string[] | Yes | — | Relative file paths from project root |
| `base` | string | No | `main` | Base branch to branch from |
| `prTitle` | string | No | message | PR title |
| `prBody` | string | No | auto-generated | PR body/description |

### Return Value

```json
{
  "success": true,
  "branch": "feat/my-feature",
  "commit": "a1b2c3d",
  "files": ["src/file.tsx"],
  "pr": {
    "url": "https://github.com/ettersAy/moussawer/pull/42",
    "number": 42,
    "action": "created"
  },
  "message": "PR created: https://github.com/ettersAy/moussawer/pull/42"
}
```

If PR creation fails but the branch/commit succeeded:
```json
{
  "success": true,
  "branch": "feat/my-feature",
  "commit": "a1b2c3d",
  "files": ["src/file.tsx"],
  "pr": null,
  "prError": "...",
  "message": "Branch updated and commit pushed, but PR creation failed. Create PR at: https://github.com/ettersAy/moussawer/pull/new/feat/my-feature"
}
```

### Error Response

```json
{
  "content": [{ "type": "text", "text": "Error: File not found: src/missing.tsx (resolved: ...)" }],
  "isError": true
}
```

## Internal Workflow

The MCP server uses the **GitHub Git Data API** to create a single commit with all files, rather than making individual commits per file:

1. **Get base branch info** — `GET /repos/{owner}/{repo}/git/refs/heads/{base}` → gets latest commit SHA
2. **Create branch** (if not exists) — `POST /repos/{owner}/{repo}/git/refs`
3. **Create blobs** — `POST /repos/{owner}/{repo}/git/blobs` for each file (base64 content)
4. **Create tree** — `POST /repos/{owner}/{repo}/git/trees` with all blob references
5. **Create commit** — `POST /repos/{owner}/{repo}/git/commits` pointing to the new tree
6. **Update branch ref** — `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` → atomically move the branch pointer
7. **Create/update PR** — `gh pr create` or `gh pr edit` for existing PRs on the same head branch

## Dependencies

- **`gh` CLI** — must be installed and the `GITHUB_TOKEN` must have repo scope
- **`@modelcontextprotocol/sdk`** — available globally as a transitive dependency
- **Node.js** — the script is a Node.js application

## Troubleshooting

### Server fails to start
Check that the environment variables in `cline_mcp_settings.json` are correct. The server validates all four (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `PROJECT_ROOT`) on startup.

### "gh command failed"
Make sure `gh` is on the PATH and the token is valid. Test with:
```bash
gh auth status
```

### File not found errors
The `PROJECT_ROOT` environment variable must point to the correct project root directory. Files specified in the `files` array are resolved relative to `PROJECT_ROOT`.

## Related

- `scripts/git-automate.sh` — Fallback shell script for manual use
- `scripts/git-wrap` — Git & GitHub CLI wrapper with token injection
