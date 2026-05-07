# Ticket 001 — QA Test Report

**Tested by:** @QA_Moussawer  
**Date:** 2026-05-07 20:52 UTC  
**Tickets:** ticket-001-login-broken.md / ticket-001-login-fix.md  
**Status:** 🔴 QA FAILED

---

## Root Cause Found

The Vite proxy returns HTTP 500 because the proxy target URL is **malformed**.

**Chain of causation:**
1. `.env.local` (created by Vercel CLI) contains `PORT=""`
2. Vite's `loadEnv()` loads `.env.local` which **overrides** `.env`'s `PORT=4000`
3. In `vite.config.ts` line 8: `const apiPort = env.PORT ?? "4000"` — the `??` operator treats `""` (empty string) as a valid value, so `apiPort` = `""`
4. The proxy URL becomes `http://localhost:` — **missing the port number**
5. Vite's http-proxy can't connect to the malformed URL → returns HTTP 500 with empty body

**Fix required in `vite.config.ts`:**
```ts
// BEFORE (broken):
const apiPort = env.PORT ?? "4000";

// AFTER (fixed):
const apiPort = env.PORT || "4000";
// or:
const apiPort = env.PORT ? env.PORT : "4000";
```

---

## Test Results

### AC1: Vite proxy health check
**Status:** ❌ FAIL

```
$ curl http://localhost:5173/api/v1/health
HTTP/1.1 500 Internal Server Error
(empty body)
```

- Direct API (`localhost:4000`) returns `200` with `{"data":{"status":"ok",...}}`
- Node.js can connect to port 4000 from localhost (both IPv4 and IPv6 work)
- The issue is specifically in the Vite proxy configuration (see Root Cause above)

### AC2: Login through Vite proxy
**Status:** ❌ FAIL

```
$ curl -X POST http://localhost:5173/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password"}'
HTTP/1.1 500 Internal Server Error
(empty body)
```

- Direct API login works perfectly: returns 200 with valid JWT token
- Admin, Client, and Photographer accounts all authenticate correctly via direct API
- Bad credentials correctly return 401 with `{"error":{"code":"INVALID_CREDENTIALS","message":"Invalid email or password"}}`
- Login is completely broken from the frontend due to proxy failure

### AC3: Only ONE `concurrently` process running
**Status:** ❌ FAIL (processes changed during testing)

At test start, there were **2 `concurrently` node processes** (PIDs 171125, 172054) and their child `tsx watch` + `vite` processes. During testing, those processes disappeared and were replaced by individually-started `tsx watch` (PID 215713) and `vite` (PID 215776) processes — these are NOT managed by `concurrently`. The `npm run dev` flow is not being used correctly.

- Original state: 2× concurrently, 3× tsx watch, 2× vite — **port conflicts inevitable**
- Current state: no concurrently, but raw tsx watch + vite — **not using npm run dev**

### AC4: No zombie tsx/node processes
**Status:** ❌ FAIL (resolved mid-test, but not by Dev)

At test start, zombie processes included:
- PID 166154/166156 — standalone tsx watch from before any concurrently was started
- PID 171361/171362 — child tsx watch of first concurrently (171125)
- PID 172085/172086 — child tsx watch of second concurrently (172054)

These processes disappeared during testing (exited on their own, not via a fix). The process cleanup is unstable and needs a proper dev-restart script usage.

### AC5: AuthContext HMR works without errors
**Status:** ⚠️ NOT TESTABLE (proxy broken)

- The `useAuth` hook is a named export from `AuthContext.tsx`, which React Fast Refresh cannot handle — this causes full page reloads during development
- However, this is a **dev experience issue**, not a login blocker
- Cannot verify actual login flow behavior since the proxy is broken

---

## Bugs Found

### Bug 1 (CRITICAL): Vite proxy target has empty port due to `.env.local` override

**Severity:** 🔴 Critical — breaks ALL frontend API calls  
**File:** `/srv/dev/moussawer/vite.config.ts` line 8  
**Reproduction:**
1. Have `.env.local` with `PORT=""` (created by Vercel CLI)
2. Start dev server with `npm run dev`
3. `curl http://localhost:5173/api/v1/health` → HTTP 500
4. Verify with `node -e "const {loadEnv}=require('vite'); console.log(loadEnv('development','.','').PORT)"` → prints `""`

**Fix:** Change `env.PORT ?? "4000"` to `env.PORT || "4000"` in `vite.config.ts`

### Bug 2 (HIGH): Duplicate `concurrently` processes cause port conflicts

**Severity:** 🟠 High — can cause EADDRINUSE crashes and proxy instability  
**Reproduction:** Run `npm run dev` multiple times without killing previous instances  
**Evidence:** Two `concurrently` node processes observed simultaneously (PIDs 171125, 172054)

### Bug 3 (MEDIUM): HMR incompatible export in AuthContext

**Severity:** 🟡 Medium — dev experience degradation, not user-facing  
**File:** `/srv/dev/moussawer/src/contexts/AuthContext.tsx`  
**Detail:** Named export `useAuth` is incompatible with React Fast Refresh, causing full page reloads on changes

---

## Summary

| AC | Criteria | Status |
|----|----------|--------|
| AC1 | `curl :5173/api/v1/health` → 200 | ❌ FAIL (500) |
| AC2 | Login through proxy returns token | ❌ FAIL (500) |
| AC3 | Single concurrently process | ❌ FAIL |
| AC4 | No zombie processes | ❌ FAIL |
| AC5 | AuthContext HMR compatible | ⚠️ N/A |

**Overall:** 🔴 **QA FAILED** — 0/5 acceptance criteria pass. The primary bug is a one-line fix in `vite.config.ts` but it has not been applied.
