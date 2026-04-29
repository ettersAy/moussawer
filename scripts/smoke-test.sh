#!/usr/bin/env bash
# ────────────────────────────────────────────────────
# Moussawer Smoke Test — start server & run Playwright
# ────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT=4000

cleanup() {
  echo "→ Cleaning up..."
  kill "$API_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  echo "✓ Done"
}
trap cleanup EXIT

# 1. Ensure database is seeded
echo "→ Seeding database..."
npm run db:reset 2>/dev/null | tail -1

# 2. Build frontend (if needed)
if [ ! -f dist/index.html ]; then
  echo "→ Building frontend..."
  npm run build | tail -1
fi

# 3. Start API (production mode — serves frontend + API)
echo "→ Starting server on http://localhost:$PORT..."
npx tsx server/index.ts &
API_PID=$!
sleep 3

# 4. Verify server is up
if ! curl -sf http://localhost:$PORT/ > /dev/null 2>&1; then
  echo "✗ Server failed to start"
  exit 1
fi
echo "✓ Server is ready ($(curl -so /dev/null -w '%{http_code}' http://localhost:$PORT/))"

# 5. Run smoke test via Playwright
echo "→ Running Playwright smoke test..."
echo ""
echo "========================================"
echo "  Call in your AI tool:"
echo "  browser_run_code filename=tests/smoke-test.js"
echo "========================================"
echo ""
echo "Server will keep running. Press Ctrl+C to stop."

# Wait forever until user stops
wait "$API_PID"
