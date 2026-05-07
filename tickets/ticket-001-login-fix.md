# Ticket 001: Login Not Working — Vite Proxy Broken & Process Conflicts

**Status:** OPEN  
**Priority:** CRITICAL  
**Created:** 2026-05-07  
**Reported by:** CR Moussawer  

---

## Problem Summary

The Moussawer app is running but **the user cannot log in through the frontend**. The root cause is that the Vite dev server's proxy to the API backend is broken — all proxied API requests return **HTTP 500** with an empty body. Direct API calls to port 4000 work fine.

---

## Symptoms

1. **Frontend login fails silently.** The login form calls `/api/v1/auth/login` through the Vite proxy (`localhost:5173` → `localhost:4000`) but gets HTTP 500.
2. **Health check through proxy fails:** `curl http://localhost:5173/api/v1/health` → HTTP 500.
3. **Direct API calls work:** `curl http://localhost:4000/api/v1/health` → HTTP 200 with `{"status":"ok"}`.
4. **Multiple process instances** are running, causing port conflicts.

---

## Root Causes (Identified)

### 1. Vite Proxy Returning HTTP 500

The Vite dev server on port 5173 proxies `/api` to `http://localhost:4000`, but all proxied requests return HTTP 500 with no body.

Files involved:
- `/srv/dev/moussawer/vite.config.ts` — proxy configuration
- `/srv/dev/moussawer/server/index.ts` — API entry point
- `/srv/dev/moussawer/server/app.ts` — Express app setup

### 2. Multiple `concurrently` Processes

There are **two** `concurrently` processes running (PIDs: 171125, 172054), each with their own `tsx watch` and `vite` children. This creates port conflicts where `tsx watch` tries to restart but port 4000 is already in use.

```
AyoubEt+  171125  concurrently -n api,web ...
AyoubEt+  172054  concurrently -n api,web ...
```

### 3. Process Cleanup Needed

Stale processes from previous `npm run dev` invocations are lingering, causing the port conflicts and possibly the proxy issue.

---

## Reproduction Steps

1. `curl http://localhost:5173/api/v1/health` → HTTP 500 (broken)
2. `curl http://localhost:4000/api/v1/health` → HTTP 200 (works)

The frontend at `http://localhost:5173/login` cannot authenticate users because all API calls fail at the proxy level.

---

## Required Fixes

1. **Kill all stale processes** — kill ALL `concurrently`, `tsx watch`, and `vite` processes on this machine.
2. **Restart the dev server** with a single `npm run dev` command.
3. **Verify the proxy works** — `curl http://localhost:5173/api/v1/health` must return 200.
4. **Verify login works end-to-end** — test via `curl -X POST http://localhost:5173/api/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"client@example.com","password":"password"}'` — must return a token.
5. **Add port-in-use handling** — if port 4000 is in use, the new process should either kill the old one or fail gracefully with a clear message.

---

## Verification

After fixing, confirm:
- [ ] `curl http://localhost:5173/api/v1/health` → `{"data":{"status":"ok"}}`
- [ ] Login API through proxy returns a valid JWT token
- [ ] Only ONE instance of `concurrently` is running
- [ ] No "Port 4000 is already in use" errors in logs
- [ ] The login page at `http://localhost:5173/login` works in a browser

---

**Assigned to:** @DevMouss_bot
