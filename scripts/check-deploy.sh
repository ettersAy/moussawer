#!/usr/bin/env bash
# check-deploy.sh — Poll production URL until deployed commit matches local git HEAD
# Usage: ./scripts/check-deploy.sh [prod_url] [timeout_seconds]
set -euo pipefail

PROD="${1:-https://moussawer.onrender.com}"
TIMEOUT="${2:-300}"
INTERVAL=10

GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
NC='\033[0m'

# Get local commit hash
LOCAL=$(git rev-parse --short HEAD 2>/dev/null) || LOCAL="unknown"
echo "=== Deploy Monitor ==="
echo "Local commit:  $LOCAL"
echo "Target:        ${PROD}/api/v1/version"
echo "Timeout:       ${TIMEOUT}s (polling every ${INTERVAL}s)"
echo ""

STARTED=$(date +%s)

while true; do
  RESP=$(/usr/bin/curl -sf "${PROD}/api/v1/version" 2>/dev/null) || true
  DEPLOYED=$(echo "$RESP" | jq -r '.data.commit // empty' 2>/dev/null) || true

  if [ -z "$DEPLOYED" ]; then
    echo -e "${YELLOW}[$(date +%H:%M:%S)] Waiting for server...${NC}"
  elif [ "$DEPLOYED" = "$LOCAL" ]; then
    ELAPSED=$(( $(date +%s) - STARTED ))
    echo -e "${GREEN}[$(date +%H:%M:%S)] Deploy complete! Commit $DEPLOYED matches local ($LOCAL)${NC}"
    echo -e "${GREEN}Deployment took ${ELAPSED}s${NC}"

    # Quick smoke test
    echo ""
    echo "--- Quick smoke test ---"
    /usr/bin/curl -sf "${PROD}/api/v1/health" | jq -c '.data'
    /usr/bin/curl -sf "${PROD}/api/v1/version" | jq -c '.data'
    echo "Frontend: $(/usr/bin/curl -s -o /dev/null -w '%{http_code}' "${PROD}/")"
    echo "Photographers: $(/usr/bin/curl -s -o /dev/null -w '%{http_code}' "${PROD}/photographers")"

    exit 0
  else
    ELAPSED=$(( $(date +%s) - STARTED ))
    echo -e "${YELLOW}[$(date +%H:%M:%S)] Deployed: $DEPLOYED | Waiting for: $LOCAL (${ELAPSED}s elapsed)${NC}"
  fi

  ELAPSED=$(( $(date +%s) - STARTED ))
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo -e "${RED}Timeout after ${TIMEOUT}s. Last deployed commit: $DEPLOYED${NC}"
    echo -e "${RED}Check Render dashboard: https://dashboard.render.com${NC}"
    exit 1
  fi

  sleep "$INTERVAL"
done
