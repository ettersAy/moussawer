#!/usr/bin/env bash
# db-check.sh — Test Moussawer database connectivity and schema sync
# Usage: ./scripts/db-check.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Load .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs) 2>/dev/null || true
fi

DB_URL="${DATABASE_URL:-}"

echo "=== Moussawer Database Check ==="

# 1. Check DATABASE_URL is set
if [ -z "$DB_URL" ]; then
  echo "FAIL: DATABASE_URL is not set"
  echo "  Create .env from .env.example or export DATABASE_URL"
  exit 1
fi
echo "OK: DATABASE_URL is set"

# 2. Detect database type
if echo "$DB_URL" | grep -q "localhost\|127.0.0.1"; then
  echo "  Type: Local PostgreSQL"
elif echo "$DB_URL" | grep -q "supabase"; then
  echo "  Type: Supabase Cloud (free tier — may pause after 1 week of inactivity)"
elif echo "$DB_URL" | grep -q "file:"; then
  echo "  Type: SQLite (local file)"
fi

# 3. Test connectivity
echo -n "Testing connection..."
if echo "$DB_URL" | grep -q "^postgres"; then
  # Extract host and port from URL for diagnostics
  HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
  PORT="${PORT:-5432}"

  if timeout 5 bash -c "echo > /dev/tcp/$HOST/$PORT" 2>/dev/null; then
    echo " reachable ($HOST:$PORT)"
  else
    echo " UNREACHABLE"
    echo "FAIL: Cannot reach database at $HOST:$PORT"
    echo ""
    echo "If Supabase free tier is paused, start a local PostgreSQL:"
    echo "  docker run -d --name moussawer-pg \\"
    echo "    -e POSTGRES_USER=moussawer -e POSTGRES_PASSWORD=moussawer123 \\"
    echo "    -e POSTGRES_DB=moussawer -p 5432:5432 postgres:14"
    echo "  Then update .env: DATABASE_URL=postgresql://moussawer:moussawer123@localhost:5432/moussawer"
    exit 1
  fi
else
  echo " skipped (not PostgreSQL)"
fi

# 4. Check Prisma schema sync
echo -n "Checking schema sync..."
if npx prisma db push --skip-generate 2>&1 | grep -q "already in sync"; then
  echo " in sync"
else
  echo ""
  echo "WARN: Schema may be out of sync. Run: npm run db:push"
fi

# 5. Check if data exists
echo -n "Checking for seeded data..."
USER_COUNT=$(npx prisma db execute --stdin 2>/dev/null <<< "SELECT COUNT(*) FROM \"User\";" | tail -1 | tr -d ' ') || true
if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
  echo " no users found"
  echo "WARN: Database may not be seeded. Run: npm run db:seed"
else
  echo " $USER_COUNT users found"
fi

echo "=== Database check complete ==="
