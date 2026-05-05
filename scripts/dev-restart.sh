#!/usr/bin/env bash
# dev-restart.sh — Safely restart Moussawer dev servers with error logging
# Usage: ./scripts/dev-restart.sh
set -euo pipefail

LOG_DIR="/srv/dev/moussawer"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/app-output-${TIMESTAMP}.log"

echo "=== Restarting Moussawer dev servers ==="

# Kill existing processes safely (by port, not name pattern)
for port in 4000 5173; do
  pids=$(lsof -ti:$port 2>/dev/null) || true
  if [ -n "$pids" ]; then
    echo "Killing processes on port $port: $pids"
    kill $pids 2>/dev/null || true
    sleep 1
  fi
done

# Wait for ports to free
for port in 4000 5173; do
  while lsof -ti:$port >/dev/null 2>&1; do
    echo "Waiting for port $port to free..."
    sleep 1
  done
done

echo "Ports 4000 and 5173 are free"

# Start the dev servers
cd /srv/dev/moussawer
echo "Starting dev servers (logs → ${LOG_FILE})"
nohup npm run dev > "$LOG_FILE" 2>&1 &

# Wait for API to be ready
echo -n "Waiting for API server..."
for i in $(seq 1 30); do
  if /usr/bin/curl -s http://localhost:4000/api/v1/health >/dev/null 2>&1; then
    echo " ready!"
    break
  fi
  echo -n "."
  sleep 1
done

# Quick health check
/usr/bin/curl -s http://localhost:4000/api/v1/health | jq .
echo "Frontend: http://localhost:5173"
echo "API docs: http://localhost:4000/api-docs"
echo "Log file: $LOG_FILE"
echo "Done."
