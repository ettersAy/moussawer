# Ticket 001: Login Broken — Users Cannot Log In Through Frontend

**Status:** Open  
**Assigned to:** @DevMouss_bot  
**Created by:** @QA_Moussawer  
**Date:** 2026-05-07  
**Priority:** 🔴 Critical — all authenticated features are unavailable to users

---

## Summary
The app is running but users cannot log in through the frontend UI. The API itself works correctly (direct calls return valid tokens), but the **Vite dev server proxy is returning HTTP 500** for all proxied `/api/*` requests. This breaks login, registration, and all authenticated flows from the browser.

---

## Root Cause Analysis (from QA investigation)

### 1. 🔴 Vite Proxy Returns HTTP 500 (PRIMARY ISSUE)
- Direct API call to `http://localhost:4000/api/v1/health` → **200 OK**
- Proxied call via Vite to `http://localhost:5173/api/v1/health` → **500 Internal Server Error**
- This breaks ALL frontend API calls including `/api/v1/auth/login`

### 2. 🟡 Duplicate `concurrently` Processes (PORT CONFLICTS)
Two instances of `concurrently` are running simultaneously:
- PID 171125 (started first)
- PID 172054 (started second)

This causes "Port 4000 is already in use" errors when tsx watch restarts, and may be related to proxy instability.

### 3. 🟡 Zombie tsx processes
Multiple orphaned tsx/node processes are accumulating from failed restarts (PIDs 166154/166156, 171361/171362).

### 4. 🟡 AuthContext HMR Incompatibility
Vite reports: `hmr invalidate /src/contexts/AuthContext.tsx Could not Fast Refresh ("useAuth" export is incompatible)` — this causes full page reloads during development, degrading the dev experience and potentially causing state loss during login.

---

## Acceptance Criteria
1. **AC1:** `curl http://localhost:5173/api/v1/health` returns 200 OK (Vite proxy works)
2. **AC2:** `curl -X POST http://localhost:5173/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"client@example.com","password":"password"}'` returns a valid token
3. **AC3:** Only ONE `concurrently` process is running — kill the duplicate
4. **AC4:** No zombie tsx/node processes from previous restarts
5. **AC5:** AuthContext HMR works without "export is incompatible" errors (or at minimum, login flow works despite it)

---

## Test Credentials (from seed data)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| Client | `client@example.com` | `password` |
| Photographer | `photographer-one@example.com` | `password` |

---

## Steps to Reproduce
1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173` in browser
3. Click "Login" and enter `client@example.com` / `password`
4. Observe: Login fails — API call returns 500 from Vite proxy

## Files Likely Involved
- `/srv/dev/moussawer/vite.config.ts` — proxy configuration
- `/srv/dev/moussawer/server/app.ts` — Express app (proxy target)
- `/srv/dev/moussawer/src/contexts/AuthContext.tsx` — auth context (HMR issue)
- `/srv/dev/moussawer/.env` / `.env.local` — environment config

---

## QA Notes
- The API on port 4000 is healthy and returns valid JWT tokens
- The database is connected and seed users exist
- The issue is specifically the Vite → Express proxy communication
