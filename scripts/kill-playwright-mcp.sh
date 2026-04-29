#!/usr/bin/env bash
#===============================================================================
# Kill Stale Playwright MCP Processes
# Usage: ./scripts/kill-playwright-mcp.sh
#
# After restarting Cline, old MCP server processes with stale arguments persist
# as zombies. This script kills all running Playwright MCP processes so only
# freshly spawned (correctly configured) ones remain.
#
# Patterns killed:
#   - npm exec @playwright/mcp@latest
#   - playwright-mcp (shell subprocess)
#   - node .../playwright-mcp (actual Node process)
#
# Before: manual `ps aux | grep playwright` + kill each PID (~2 min/restart)
# After:  `./scripts/kill-playwright-mcp.sh` (~2 seconds)
#===============================================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ---- Help ----
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '3,16p' "$0"
  exit 0
fi

# ---- Find matching PIDs ----
# We search for three patterns to catch all layers of the Playwright MCP process tree:
#   1. "npm exec.*playwright" — the npm wrapper
#   2. "playwright-mcp" — the shell and binary names
# We use pgrep for reliability; fall back to ps+awk if pgrep unavailable.
PIDS=""

if command -v pgrep &>/dev/null; then
  PIDS=$(pgrep -f "@playwright/mcp" 2>/dev/null || true)
  PIDS_PW=$(pgrep -f "playwright-mcp" 2>/dev/null || true)
  PIDS="$PIDS $PIDS_PW"
else
  # Fallback: use ps + grep + awk
  PIDS=$(ps aux | grep -E '@playwright/mcp|playwright-mcp' | grep -v grep | awk '{print $2}' | tr '\n' ' ')
fi

# Deduplicate and trim
PIDS=$(echo "$PIDS" | tr ' ' '\n' | grep -v '^$' | sort -u | tr '\n' ' ')

if [[ -z "$PIDS" || "$PIDS" =~ ^[[:space:]]*$ ]]; then
  echo -e "${GREEN}✓ No stale Playwright MCP processes found.${NC}"
  exit 0
fi

# ---- Kill ----
COUNT=0
for PID in $PIDS; do
  # Verify the process still exists before trying to kill
  if kill -0 "$PID" 2>/dev/null; then
    # Get process info for logging
    CMD=$(ps -o args= -p "$PID" 2>/dev/null || echo "unknown")
    echo -e "  ${RED}Killing PID ${PID}${NC} — ${CMD:0:100}"
    kill "$PID" 2>/dev/null || true
    COUNT=$((COUNT + 1))
  fi
done

# Give processes a moment to terminate gracefully
sleep 1

# Check for survivors and SIGKILL if needed
SURVIVORS=""
for PID in $PIDS; do
  if kill -0 "$PID" 2>/dev/null; then
    SURVIVORS="$SURVIVORS $PID"
  fi
done

if [[ -n "$SURVIVORS" ]]; then
  echo -e "${YELLOW}⚠ ${COUNT} processes killed, but some did not terminate gracefully. Forcing SIGKILL...${NC}"
  for PID in $SURVIVORS; do
    CMD=$(ps -o args= -p "$PID" 2>/dev/null || echo "unknown")
    echo -e "  ${RED}Force killing PID ${PID}${NC} — ${CMD:0:100}"
    kill -9 "$PID" 2>/dev/null || true
  done

  # Final verification
  sleep 0.5
  FINAL=""
  for PID in $PIDS; do
    if kill -0 "$PID" 2>/dev/null; then
      FINAL="$FINAL $PID"
    fi
  done

  if [[ -n "$FINAL" ]]; then
    echo -e "${RED}✖ Failed to kill PIDs:${NC}$FINAL"
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}✓ Killed ${COUNT} stale Playwright MCP process(es).${NC}"
echo -e "${GREEN}✓ Clean slate ready for fresh MCP server spawn.${NC}"
