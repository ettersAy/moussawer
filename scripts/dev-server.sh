#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# Start Moussawer API server in background
# Usage: ./scripts/dev-server.sh [port]
# ─────────────────────────────────────────────────────
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${1:-4000}"

fuser -k "$PORT/tcp" 2>/dev/null || true
sleep 1

echo "→ Starting API server on port $PORT..."
nohup node --import tsx server/index.ts >/dev/null 2>&1 &
sleep 3

if curl -sf "http://localhost:$PORT/api/v1/health" > /dev/null 2>&1; then
  echo "✅ Server ready at http://localhost:$PORT"
else
  echo "❌ Server failed to start"
  exit 1
fi
