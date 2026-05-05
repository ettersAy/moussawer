#!/usr/bin/env bash
# schema-check.sh — Validate Prisma schema integrity beyond what prisma validate does
# Usage: ./scripts/schema-check.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEMA="${PROJECT_DIR}/prisma/schema.prisma"

echo "=== Prisma Schema Integrity Check ==="

# 1. Prisma's built-in validation
echo -n "prisma validate... "
if npx prisma validate 2>&1 | grep -q "valid"; then
  echo "PASS"
else
  echo "FAIL"
  npx prisma validate 2>&1
  exit 1
fi

# 2. Check for fields ending in 'Id' that may be missing @relation
echo "Checking for FK fields without @relation..."
MISSING=0
PREV_LINE=""
while IFS= read -r line; do
  FIELD=$(echo "$line" | sed -n 's/.* \([a-zA-Z]*Id\) .*/\1/p')
  if [ -n "$FIELD" ] && ! echo "$line" | grep -q "@relation\|@id\|@@id"; then
    # Also check if previous line had @relation (multi-line field defs)
    if echo "$PREV_LINE" | grep -q "@relation"; then
      PREV_LINE="$line"
      continue
    fi
    echo "  WARN: $FIELD may be missing @relation annotation"
    MISSING=$((MISSING + 1))
  fi
  PREV_LINE="$line"
done < "$SCHEMA"

if [ "$MISSING" -eq 0 ]; then
  echo "  OK: No suspicious FK fields found"
else
  echo "  WARN: $MISSING field(s) may need @relation annotations — review manually"
fi

# 3. Check for String fields named 'metadata' that should be Json type
echo "Checking for String metadata fields..."
STRING_META=$(grep -c 'metadata\s*String' "$SCHEMA" 2>/dev/null || echo 0)
if [ "$STRING_META" -gt 0 ]; then
  echo "  WARN: $STRING_META metadata field(s) use String type — consider Json for PostgreSQL"
else
  echo "  OK: No String metadata fields"
fi

# 4. Check for common missing indexes
echo "Checking for models without any @@index..."
while IFS= read -r model; do
  # Get the block between this model and the next
  BLOCK=$(sed -n "/^model $model/,/^model/p" "$SCHEMA")
  if ! echo "$BLOCK" | grep -q "@@index"; then
    FK_COUNT=$(echo "$BLOCK" | grep -c '^\s*[a-zA-Z]*Id\s' || true)
    if [ "$FK_COUNT" -gt 1 ]; then
      echo "  WARN: model $model has $FK_COUNT FK fields but no @@index — queries may be slow"
    fi
  fi
done < <(grep '^model ' "$SCHEMA" | awk '{print $2}')

echo "=== Schema check complete ==="
echo "Run 'npx prisma format' to auto-fix formatting issues."
