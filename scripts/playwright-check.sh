#!/usr/bin/env bash
# playwright-check.sh — Verify Playwright browser is usable before attempting UI tests
# Usage: ./scripts/playwright-check.sh
set -euo pipefail

echo "=== Playwright Browser Check ==="

# 1. Check for chrome/chromium in common locations
FOUND=""
for candidate in \
  /opt/google/chrome/chrome \
  ~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome \
  ~/.cache/ms-playwright/mcp-chrome-*/chrome; do
  for match in $candidate; do
    if [ -f "$match" ] && [ -x "$match" ]; then
      FOUND="$match"
      break 2
    fi
  done
done

if [ -z "$FOUND" ]; then
  echo "FAIL: No Chrome/Chromium binary found"
  echo ""
  echo "Install options:"
  echo "  1. npx playwright install chromium"
  echo "  2. sudo apt install chromium-browser"
  echo ""
  echo "For MCP Playwright server, ensure browser path is configured."
  exit 1
fi

echo "OK: Found browser at $FOUND"

# 2. Check if it runs
VERSION=$("$FOUND" --version 2>/dev/null) || true
if [ -n "$VERSION" ]; then
  echo "  Version: $VERSION"
else
  echo "FAIL: Browser binary found but won't execute"
  exit 1
fi

# 3. Check the MCP symlink
MCP_LINK="/opt/google/chrome/chrome"
if [ -L "$MCP_LINK" ]; then
  TARGET=$(readlink -f "$MCP_LINK" 2>/dev/null) || true
  if [ -f "$TARGET" ]; then
    echo "OK: MCP symlink $MCP_LINK → $TARGET"
  else
    echo "WARN: MCP symlink is broken ($MCP_LINK → $TARGET)"
    echo "  Fix: ln -sf $FOUND $MCP_LINK  (requires sudo)"
    echo "  Or: configure MCP server to use $FOUND directly"
  fi
elif [ -f "$MCP_LINK" ]; then
  echo "OK: MCP browser at $MCP_LINK"
else
  echo "WARN: $MCP_LINK does not exist"
  echo "  MCP Playwright server will fail without this path."
  echo "  Create it: sudo mkdir -p /opt/google && sudo ln -sf $FOUND /opt/google/chrome/chrome"
fi

echo "=== Browser check complete ==="
echo "Browser is usable for Playwright UI tests."
