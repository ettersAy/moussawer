# Problem
After restarting Cline, old MCP server processes with stale arguments persist as zombies. AI agents must manually `ps aux | grep playwright`, identify the stale processes, and kill them. This is repeated multiple times per session.

# Improvement Needed
Create a utility script that kills all running Playwright MCP processes so only freshly spawned (correctly configured) ones remain after a restart.

# Expected Result
Eliminates the manual zombie-killing step that currently wastes ~2 minutes per restart cycle.
