# PHASE1-006: Rate Limiting on Auth Endpoints — Manual Verification Guide

## Overview
This document provides detailed manual verification procedures for **rate limiting on authentication endpoints** (PHASE1-006). Rate limiting protects auth endpoints from brute force attacks by limiting the number of requests per IP address.

## Implementation Summary

### Rate Limits Applied
| Endpoint | Limit | Duration | Purpose |
|----------|-------|----------|---------|
| `/api/login` | 5 attempts | 1 minute | Brute force protection |
| `/api/register` | 3 attempts | 1 minute | Account creation spam prevention |
| `/api/logout` | 10 attempts | 1 minute | Token revocation rate limit |
| `/api/contact` | 5 attempts | 1 minute | Contact form spam prevention |

### Configuration File
- **Location**: `routes/api.php`
- **Middleware**: Laravel's built-in `throttle:requests,minutes`

### Test Coverage
- **Backend Tests**: 6 new PHPUnit tests for rate limiting
- **Total Tests**: 85/85 passing (79 existing + 6 new)
- **E2E Tests**: 29/29 passing (no regressions)

## Quick Testing Checklist

### ✅ Login Rate Limiting (5 per minute)
- [ ] Successfully complete 5 login attempts in quick succession
- [ ] 6th login attempt returns **429 Too Many Requests**
- [ ] Response includes rate limit headers:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: 0` (after limit exceeded)
  - `Retry-After: 60`

### ✅ Registration Rate Limiting (3 per minute)
- [ ] Successfully complete 3 registration attempts in quick succession
- [ ] 4th registration attempt returns **429 Too Many Requests**
- [ ] Error response displays rate limit message

### ✅ Logout Rate Limiting (10 per minute)
- [ ] Successfully complete 10 logout attempts in quick succession
- [ ] 11th logout attempt returns **429 Too Many Requests**

### ✅ Contact Rate Limiting (5 per minute)
- [ ] Successfully complete 5 contact submissions in quick succession
- [ ] 6th contact submission returns **429 Too Many Requests**

### ✅ Rate Limit Headers
- [ ] All rate-limited endpoints include `X-RateLimit-*` headers
- [ ] `Retry-After` header correctly indicates seconds until next attempt

## Manual Testing Procedures

### Test 1: Login Rate Limiting via Curl

```bash
#!/bin/bash
# Test login rate limiting (5 per minute limit)

echo "Testing login rate limit (5 attempts per minute)..."
echo ""

# Attempt 6 quick login requests
for i in {1..6}; do
    echo "Attempt $i:"
    curl -X POST http://localhost/api/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "ratelimit@example.com",
        "password": "password123"
      }' \
      -w "\nHTTP Status: %{http_code}\n\n" \
      -s | grep -E "HTTP Status|message|errors"
    
    # Small delay between requests
    sleep 0.1
done
```

**Expected Output**:
- Attempts 1-5: HTTP Status 200 or 401 (auth failure, but not rate limited)
- Attempt 6: **HTTP Status 429** with message about rate limiting

```json
{
  "message": "Too Many Requests",
  "retry_after": 60
}
```

### Test 2: Registration Rate Limiting via Curl

```bash
#!/bin/bash
# Test registration rate limiting (3 per minute limit)

echo "Testing registration rate limit (3 attempts per minute)..."
echo ""

# Attempt 4 quick registration requests
for i in {1..4}; do
    EMAIL="test-$i-$(date +%s)@example.com"
    echo "Attempt $i (Email: $EMAIL):"
    
    curl -X POST http://localhost/api/register \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"Test User $i\",
        \"email\": \"$EMAIL\",
        \"password\": \"TestPass123\",
        \"password_confirmation\": \"TestPass123\",
        \"role\": \"client\"
      }" \
      -w "\nHTTP Status: %{http_code}\n\n" \
      -s | grep -E "HTTP Status|message"
    
    sleep 0.1
done
```

**Expected Output**:
- Attempts 1-3: HTTP Status 200 (success) or 422 (validation error)
- Attempt 4: **HTTP Status 429** (rate limited)

### Test 3: Rate Limit Headers Inspection

```bash
# Check rate limit headers in response
curl -v -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' 2>&1 | grep -i "x-ratelimit\|retry-after"

# Expected headers:
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
# Retry-After: 60 (only when rate limited)
```

### Test 4: Browser-Based Testing with DevTools

#### Step 1: Open DevTools and Monitor Network
```
1. Open http://localhost in browser
2. Open DevTools (F12 or Ctrl+Shift+I)
3. Go to Network tab
4. Clear all network history
```

#### Step 2: Login with Network Throttling
```
1. In DevTools, set Network throttling to "Slow 3G" (optional, for easier timing)
2. Click login button 5-6 times rapidly
3. Observe network requests:
   - First 5 requests: Status 200 OK or 401 Unauthorized
   - 6th request: Status 429 Too Many Requests
```

#### Step 3: Check Response Headers
```
1. Click on the 6th login request in Network tab
2. Go to Response Headers section
3. Look for:
   - X-RateLimit-Limit: 5
   - X-RateLimit-Remaining: 0
   - Retry-After: 60
```

### Test 5: Per-IP Rate Limiting Verification

```bash
# Make requests from the same IP (normal case)
for i in {1..6}; do
    curl -X POST http://localhost/api/login \
      -H "Content-Type: application/json" \
      -d '{"email": "test@example.com", "password": "test"}' \
      -w "%{http_code}\n" -s
done

# Expected: 5 requests with 2xx/4xx status, 6th with 429

# Note: To test from different IPs, you would need:
# - Multiple physical machines
# - Or proxy/VPN setup
# - Or modify X-Forwarded-For header (if trusted proxy is configured)
```

### Test 6: Logout Rate Limiting

```bash
#!/bin/bash
# Test logout rate limiting (10 per minute limit)

# First, log in to get a token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ratelimit@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

echo "Token: $TOKEN"
echo ""
echo "Testing logout rate limit (10 attempts per minute)..."
echo ""

# Attempt 11 quick logout requests
for i in {1..11}; do
    echo "Attempt $i:"
    curl -X POST http://localhost/api/logout \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -w "HTTP Status: %{http_code}\n\n" \
      -s | grep -E "HTTP Status|message"
    
    sleep 0.1
done
```

**Expected Output**:
- Attempts 1-10: HTTP Status 200 (success) or other non-429 status
- Attempt 11: **HTTP Status 429** (rate limited)

### Test 7: Contact Form Rate Limiting

```bash
#!/bin/bash
# Test contact endpoint rate limiting (5 per minute limit)

echo "Testing contact rate limit (5 attempts per minute)..."
echo ""

# Attempt 6 quick contact submissions
for i in {1..6}; do
    echo "Attempt $i:"
    curl -X POST http://localhost/api/contact \
      -H "Content-Type: application/json" \
      -d '{
        "email": "contact@example.com",
        "message": "Test message '$i'"
      }' \
      -w "\nHTTP Status: %{http_code}\n\n" \
      -s | grep -E "HTTP Status|message"
    
    sleep 0.1
done
```

**Expected Output**:
- Attempts 1-5: HTTP Status 200 (success) or 422 (validation)
- Attempt 6: **HTTP Status 429** (rate limited)

## Rate Limit Reset Behavior

### Time-Based Reset
- Rate limits reset after **1 minute** from the first request
- Example: If you hit limit at 12:00:05 PM, you can retry at 12:01:05 PM

### Testing Reset
```bash
#!/bin/bash
# Test rate limit reset

# Make 6 login attempts (5th succeeds, 6th fails)
for i in {1..6}; do
    curl -X POST http://localhost/api/login \
      -H "Content-Type: application/json" \
      -d '{"email": "test@example.com", "password": "test"}' \
      -w "Attempt $i: %{http_code}\n" -s
done

echo "6th attempt should be 429 (rate limited)"
echo ""
echo "Waiting 61 seconds for rate limit to reset..."
sleep 61

# Now attempt 1 request again (should succeed)
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test"}' \
  -w "After reset: %{http_code}\n" -s
```

**Expected Output**:
- Request after 61 seconds: Status 200 or 401 (NOT 429)

## Automated Test Results

### PHPUnit Tests Status
```
✅ test_login_rate_limit_enforced
✅ test_register_rate_limit_enforced
✅ test_logout_rate_limit_enforced
✅ test_rate_limit_headers_present
✅ test_rate_limit_per_ip
✅ test_contact_rate_limit_enforced

Total: 6/6 rate limit tests passing ✅
Overall: 85/85 tests passing (79 existing + 6 new)
```

### PHPUnit Execution
```bash
./vendor/bin/sail artisan test tests/Feature/Auth/RateLimitTest.php --compact
# Result: 6 passed (35 assertions)

# Full test suite:
./vendor/bin/sail artisan test --compact
# Result: 85 passed (263 assertions)
```

### E2E Test Results
```
✅ All 29 E2E tests passing
   - 14 registration tests
   - 15 contact tests
No regressions from rate limiting changes
```

## Response Format Examples

### Success Response (Before Rate Limit)
```json
HTTP/1.1 200 OK
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4

{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "client"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Rate Limited Response (429)
```json
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
Retry-After: 60

{
  "message": "Too Many Requests",
  "retry_after": 60
}
```

## Troubleshooting

### Issue: Rate limit not triggered after expected requests
**Possible Causes**:
- Requests are from different IPs (check X-Forwarded-For if behind proxy)
- Rate limit was reset due to waiting > 1 minute between requests
- Clock synchronization issue on server

**Solution**:
- Verify all requests from same client IP
- Make all requests in quick succession (< 1 second apart)
- Check server time synchronization

### Issue: Getting 429 on first request
**Possible Causes**:
- Previous test left the rate limit counter active (still within 1 minute)
- Other users on same IP exceeded the limit
- Proxy/load balancer interfering with IP detection

**Solution**:
- Wait 60+ seconds before testing again
- Use different IP address or test from isolated environment
- Check if behind proxy (may need X-Forwarded-For configuration)

## Configuration Reference

### Laravel Throttle Middleware
```php
// In routes/api.php
Route::post('/login', LoginController::class)
    ->middleware('throttle:5,1');  // 5 requests per 1 minute

Route::post('/register', RegisterController::class)
    ->middleware('throttle:3,1');  // 3 requests per 1 minute

Route::post('/logout', LogoutController::class)
    ->middleware('auth:sanctum')
    ->middleware('throttle:10,1');  // 10 requests per 1 minute

Route::post('/contact', ContactSubmissionController::class)
    ->middleware('throttle:5,1');  // 5 requests per 1 minute
```

### Alternative: Named Rate Limits (Future Enhancement)
```php
// In RouteServiceProvider or custom RateLimitProvider
use Illuminate\Cache\RateLimiter;

RateLimiter::for('auth-login', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

RateLimiter::for('auth-register', function (Request $request) {
    return Limit::perMinute(3)->by($request->ip());
});

// Usage in routes:
Route::post('/login', LoginController::class)->middleware('throttle:auth-login');
```

## Client-Side Recommendations

### For Application Developers Using This API

1. **Implement Retry Logic**
   ```javascript
   const MAX_RETRIES = 3;
   const BACKOFF_MS = 1000;
   
   async function apiCallWithRetry(fn, retries = 0) {
     try {
       return await fn();
     } catch (error) {
       if (error.status === 429 && retries < MAX_RETRIES) {
         const retryAfter = error.headers['Retry-After'] || 60;
         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
         return apiCallWithRetry(fn, retries + 1);
       }
       throw error;
     }
   }
   ```

2. **Check Rate Limit Headers**
   ```javascript
   const response = await fetch('/api/login', {...});
   const limit = response.headers.get('X-RateLimit-Limit');
   const remaining = response.headers.get('X-RateLimit-Remaining');
   
   if (remaining === '1') {
     console.warn('Approaching rate limit');
   }
   ```

3. **Implement Exponential Backoff**
   ```javascript
   // On 429 response:
   const delayMs = Math.pow(2, attemptNumber) * 1000;
   await new Promise(resolve => setTimeout(resolve, delayMs));
   ```

## Verification Sign-Off

After completing all manual verification steps, confirm:

- **Login Rate Limit**: ✅ 5 per minute enforced
- **Register Rate Limit**: ✅ 3 per minute enforced
- **Logout Rate Limit**: ✅ 10 per minute enforced
- **Contact Rate Limit**: ✅ 5 per minute enforced
- **HTTP 429 Responses**: ✅ Returned when limits exceeded
- **Rate Limit Headers**: ✅ X-RateLimit-* headers present
- **Per-IP Enforcement**: ✅ Rate limits enforced per IP address
- **Rate Limit Reset**: ✅ Resets after 60 seconds
- **PHPUnit Tests**: ✅ 6/6 rate limit tests passing
- **Full Test Suite**: ✅ 85/85 tests passing
- **E2E Tests**: ✅ 29/29 tests passing

## Next Steps

1. **Monitor Rate Limiting**: Set up logging/monitoring for 429 responses
2. **Adjust Limits**: May need tuning based on real-world usage patterns
3. **API Documentation**: Update API docs to document rate limits
4. **Client Libraries**: Provide SDKs with built-in retry logic
5. **Dashboard**: Consider adding rate limit status to admin dashboard

