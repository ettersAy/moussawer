#!/usr/bin/env bash
# smoke-test.sh — Test all Moussawer API endpoints and report pass/fail
# Usage: ./scripts/smoke-test.sh [base_url]
set -euo pipefail

BASE="${1:-http://localhost:4000}"
API="${BASE}/api/v1"
PASS=0
FAIL=0

red()  { echo -e "\033[31m$1\033[0m"; }
green(){ echo -e "\033[32m$1\033[0m"; }

check() {
  local label="$1" method="$2" url="$3" data="$4" jq_expr="$5" want="${6:-}"
  local curl_args=(-s -X "$method" "${API}${url}" -H "Content-Type: application/json")
  if [ -n "${TOKEN:-}" ]; then curl_args+=(-H "Authorization: Bearer $TOKEN"); fi
  if [ -n "$data" ]; then curl_args+=(-d "$data"); fi

  local resp
  resp=$(/usr/bin/curl "${curl_args[@]}" 2>/dev/null)
  local got
  got=$(echo "$resp" | jq -r "$jq_expr" 2>/dev/null) || true

  if [ -n "$want" ] && [ "$got" = "$want" ]; then
    green "  PASS $label"
    PASS=$((PASS + 1))
  elif [ -z "$want" ] && [ -n "$got" ] && [ "$got" != "null" ]; then
    green "  PASS $label (got: $got)"
    PASS=$((PASS + 1))
  else
    red "  FAIL $label (got: $got, want: $want)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Moussawer Smoke Test ==="
echo "Target: $API"
echo ""

# --- Health ---
echo "--- Health ---"
TOKEN=""
check "health" GET "/health" "" ".data.status" "ok"

# --- Auth ---
echo "--- Auth ---"
TOKEN=""
check "login_admin" POST "/auth/login" '{"email":"admin@example.com","password":"password"}' ".data.user.role" "ADMIN"
check "login_client" POST "/auth/login" '{"email":"client@example.com","password":"password"}' ".data.user.role" "CLIENT"
check "login_photo" POST "/auth/login" '{"email":"photographer-one@example.com","password":"password"}' ".data.user.role" "PHOTOGRAPHER"
check "register_validation" POST "/auth/register" '{"email":"bad","password":"12","name":"X","role":"CLIENT"}' ".error.code" "VALIDATION_ERROR"

# Fetch tokens for authenticated tests
TOKEN=$(/usr/bin/curl -s -X POST "${API}/auth/login" -H "Content-Type: application/json" -d '{"email":"client@example.com","password":"password"}' | jq -r '.data.token')
ADMIN_TOKEN=$(/usr/bin/curl -s -X POST "${API}/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}' | jq -r '.data.token')
PHOTO_TOKEN=$(/usr/bin/curl -s -X POST "${API}/auth/login" -H "Content-Type: application/json" -d '{"email":"photographer-one@example.com","password":"password"}' | jq -r '.data.token')
CLIENT_TOKEN="$TOKEN"

# --- Me ---
echo "--- Me ---"
check "me" GET "/me" "" ".data.email" "client@example.com"

# --- Discovery ---
echo "--- Discovery ---"
check "categories" GET "/categories" "" ".data | length" ""
check "photographers" GET "/photographers" "" ".meta.total" ""
PHOTO_ID=$(/usr/bin/curl -s "${API}/photographers" | jq -r '.data[0].id')
check "photo_detail" GET "/photographers/${PHOTO_ID}" "" ".data.slug" ""
check "photo_reviews" GET "/photographers/${PHOTO_ID}/reviews" "" ".data | length" ""

# --- Bookings ---
echo "--- Bookings ---"
TOKEN="$ADMIN_TOKEN"
check "bookings_list" GET "/bookings?limit=5" "" ".meta.total" ""
TOKEN="$CLIENT_TOKEN"
SERVICE_ID=$(/usr/bin/curl -s "${API}/photographers/${PHOTO_ID}" | jq -r '.data.services[0].id')
# Try booking at a known-valid time (13:00 UTC = 09:00 Toronto, far future to avoid conflicts)
FUTURE_DATE=$(date -d "+60 days" +%Y-%m-%d 2>/dev/null || echo "2026-07-04")
check "create_booking" POST "/bookings" "{\"photographerId\":\"${PHOTO_ID}\",\"serviceId\":\"${SERVICE_ID}\",\"startAt\":\"${FUTURE_DATE}T13:00:00Z\",\"location\":\"Toronto\",\"notes\":\"smoke test\"}" ".data.status" "PENDING"

# --- Messaging ---
echo "--- Messaging ---"
check "conversations" GET "/conversations?limit=5" "" ".meta.total" ""
CONVO_ID=$(/usr/bin/curl -s "${API}/conversations?limit=1" -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id // empty')
if [ -n "$CONVO_ID" ]; then
  check "messages" GET "/conversations/${CONVO_ID}/messages" "" ".data | length" ""
  check "send_msg" POST "/conversations/${CONVO_ID}/messages" '{"body":"smoke test message"}' ".data.body" "smoke test message"
fi

# --- Portfolio ---
echo "--- Portfolio ---"
TOKEN="$PHOTO_TOKEN"
check "create_portfolio" POST "/portfolio" '{"title":"Smoke Test","description":"Auto","imageUrl":"https://example.com/smoke.jpg","tags":["smoke"]}' ".data.title" "Smoke Test"

# --- Favorites ---
echo "--- Favorites ---"
TOKEN="$CLIENT_TOKEN"
check "add_fav" POST "/favorites/${PHOTO_ID}" "" ".data.userId" ""
check "list_fav" GET "/favorites" "" ".data | length" ""

# --- Notifications ---
echo "--- Notifications ---"
check "notifications" GET "/notifications" "" ".data | length" ""

# --- Support ---
echo "--- Support ---"
TOKEN=""
check "support" POST "/support" '{"name":"Smoke","email":"smoke@test.com","subject":"Test","message":"Smoke test"}' ".data.message" "Support request received"

# --- Admin ---
echo "--- Admin ---"
TOKEN="$ADMIN_TOKEN"
check "admin_stats" GET "/admin/stats" "" ".data.totalUsers" ""
check "admin_users" GET "/admin/users?limit=5" "" ".meta.total" ""
check "admin_activity" GET "/admin/activity?limit=5" "" ".meta.total" ""

# --- Photographer Dashboard ---
echo "--- Photographer Dashboard ---"
TOKEN="$PHOTO_TOKEN"
check "photo_me" GET "/me/photographer" "" ".data.slug" ""
check "my_services" GET "/me/services" "" ".data | length" ""
check "my_availability" GET "/me/availability" "" ".data.rules | length" ""

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
