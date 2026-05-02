#!/usr/bin/env bash
# scripts/audit-resource-callers.sh
#
# Purpose: Grep-based audit of all callers of server/services/resources.ts functions.
# Run BEFORE modifying any resource serializer's parameter type to discover all
# routes/includes that need coordinated updates.
#
# Usage:
#   ./scripts/audit-resource-callers.sh
#   ./scripts/audit-resource-callers.sh bookingResource   # filter by specific function
#
# Output: Lists every file that imports each resource function, grouped by function name.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RESOURCES_FILE="$SCRIPT_DIR/server/services/resources.ts"

echo "=== Resource Function Caller Audit ==="
echo "Source: $RESOURCES_FILE"
echo ""

# Extract all exported function names from resources.ts
FUNCTIONS=$(grep -E '^export function [a-zA-Z]+Resource\(' "$RESOURCES_FILE" | sed -E 's/^export function ([a-zA-Z]+Resource)\(.*/\1/')

if [ $# -gt 0 ]; then
  FILTER="$1"
  FUNCTIONS=$(echo "$FUNCTIONS" | grep -F "$FILTER" || true)
  if [ -z "$FUNCTIONS" ]; then
    echo "No resource function matching '$FILTER' found. Available:"
    echo "$FUNCTIONS"
    exit 1
  fi
fi

HAS_ANY=false

for func in $FUNCTIONS; do
  # Find all files that import this function (excluding the source file itself)
  CALLERS=$(grep -rl "$func" "$SCRIPT_DIR/server" --include="*.ts" 2>/dev/null | grep -v "$RESOURCES_FILE" || true)

  if [ -n "$CALLERS" ]; then
    HAS_ANY=true
    echo "▶ $func"
    echo "$CALLERS" | sed 's/^/    /'
    echo ""
  fi
done

# Also show includes that are referenced together
echo "=== Include objects (server/routes/includes.ts) ==="
INCLUDES=$(grep -E '^export const [a-zA-Z]+Include' "$SCRIPT_DIR/server/routes/includes.ts" 2>/dev/null | sed -E 's/^export const ([a-zA-Z]+Include) =.*/\1/' || echo "(includes.ts not found)")
for inc in $INCLUDES; do
  INCLUDE_CALLERS=$(grep -rl "$inc" "$SCRIPT_DIR/server" --include="*.ts" 2>/dev/null | grep -v "$SCRIPT_DIR/server/routes/includes.ts" || true)
  if [ -n "$INCLUDE_CALLERS" ]; then
    echo "▶ $inc"
    echo "$INCLUDE_CALLERS" | sed 's/^/    /'
    echo ""
  fi
done

if [ "$HAS_ANY" = false ]; then
  echo "No callers found for any resource function."
fi

echo "=== Done ==="
