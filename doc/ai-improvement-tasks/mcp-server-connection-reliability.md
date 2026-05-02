# Problem
The `moussawer-mcp` MCP server failed with `MCP error -32000: Connection closed` on first invocation. No fallback or retry mechanism exists when an MCP server fails to connect. The error provides no diagnostic information about why the connection closed (port conflict, unhandled exception, missing dependency, startup timeout).

# Improvement Needed
Implement connection reliability improvements for custom MCP servers:
1. Add startup timeout detection and retry logic.
2. Surface server startup logs (stderr/stdout) in the error message instead of a generic "Connection closed".
3. Add a health-check endpoint or startup probe that the MCP client can verify before marking the server as ready.

# Expected Result
Future AI agents should either:
- Get a detailed error message explaining why the MCP server failed to start (port in use? missing module? crash loop?).
- Or have a retry mechanism that allows transient failures to self-recover.
- Or have clear instructions in `.clinerules` on what to check when a specific MCP server (like moussawer-mcp) fails to connect.
