# Incident Report: `git_automate` PR Update Failure

**Date:** 2026-05-02
**Severity:** Medium — workaround exists (manual push + branch tracking)
**Tool:** `git_automate` (git-automate-mcp)

---

## Failure Scenario

1. Agent called `git_automate` with branch `feat/core-features-and-self-audit` and 18 files → PR #77 created successfully.
2. Agent made 2 additional file changes (`.clinerules`, `doc/dev-scripts.md`) and called `git_automate` again with the same branch and same PR title/body → expected it to update PR #77.
3. The commit (`fddb7b6`) was pushed to the remote branch successfully, but the PR update step failed:

```
prError: "gh command failed: gh pr edit 77 --title ... --body ...
GraphQL: Your token has not been granted the required scopes to execute this query.
The 'login' field requires one of the following scopes: ['read:org']
```

4. Since the commit WAS pushed to the same branch, it appeared in PR #77 automatically (because GitHub tracks the branch). The failure was only in the PR metadata update (title/body).

**Net impact:** Minor — the code landed correctly; only the PR description wasn't updated. Agent had to verify manually that the commit appeared.

---

## Root Causes

### 1. Token Scope Insufficiency
The GitHub PAT used has `repo` scope but lacks `read:org` and `read:discussion`. The `gh pr edit` command uses GraphQL queries that touch `login`, `name`, and `slug` fields which require broader scopes. This is an environment/setup issue, not a code bug.

### 2. No Graceful Degradation on PR Update Failure
When `gh pr edit` fails, the tool reports `pr: null` and `prError: "..."`. But it doesn't tell the agent: *"The commit was pushed and WILL appear in the existing PR. You just can't update the title/body."* The agent was left uncertain whether the push actually landed.

### 3. No `prAction` or `action` Field in Response
The response shows `commit` and `branch` but doesn't indicate what operation was attempted or whether it was a create vs update. An `action: "created" | "updated" | "skipped"` field would clarify intent.

---

## Proposed Improvements

### A. Distinguish "commit succeeded, PR metadata failed" from "total failure"

Current response:
```json
{ "success": true, "pr": null, "prError": "gh command failed..." }
```

Proposed:
```json
{
  "success": true,
  "commit": "fddb7b6",
  "branch": "feat/core-features-and-self-audit",
  "pr": { "number": 77, "action": "committed-only" },
  "prWarnings": ["PR #77 exists but title/body update failed. Commit was pushed and is visible in the PR."]
}
```

The key addition: **if the commit push succeeded but PR metadata update failed, return `pr.action: "committed-only"` with a clear human-readable warning.** This tells the agent the data is safe without needing to verify manually.

### B. Add a `dryRun` or `skipPrUpdate` Parameter

When re-pushing to an existing branch, an agent may not care about updating the PR title/body:
```
git_automate({ branch: "feat/x", files: [...], skipPrUpdate: true })
```
This avoids the failing `gh pr edit` call entirely when only pushing new commits.

### C. Add `action` Field to Response

```json
{ "pr": { "url": "...", "number": 77, "action": "created" } }
{ "pr": { "url": "...", "number": 77, "action": "updated" } }
{ "pr": { "url": "...", "number": 77, "action": "committed-only" } }
```

This makes it immediately clear whether this was a new PR, an update, or a commit-only push.

### D. Fallback: Close + Recreate Pattern

Add a `replacePr: true` option that:
1. Closes the existing PR with a comment linking to the new one
2. Creates a fresh PR from the current branch

Useful when the PR description needs significant changes and token scopes prevent `gh pr edit`.

---

## Actions for Maintainer

| Priority | Action |
|----------|--------|
| P0 | Add `pr.action` field to response (created/updated/committed-only) |
| P1 | When commit succeeds but PR metadata fails, return `prWarnings` with clear message |
| P2 | Add `skipPrUpdate` parameter to avoid the `gh pr edit` call |
| P3 | Document required token scopes (`repo`, `read:org`) in tool description |
