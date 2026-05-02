#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# Quality gate: lint → type check → build
# Usage: ./scripts/check-quality.sh
# ─────────────────────────────────────────────────────
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Lint check..."
npx eslint src/ server/ --max-warnings 5

echo "→ Type check + build..."
npm run build

echo "✅ All quality checks pass"
