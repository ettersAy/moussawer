# Ticket 001: Add Login Page

**Status:** ✅ DONE  
**Priority:** P1  
**Assigned to:** @DevMouss_bot  
**Created:** 2026-05-07  
**Resolved:** 2026-05-07  

---

## Description

Add a functional login page at `/login` that authenticates users via the API and redirects to `/dashboard` on success.

---

## Implementation Notes

### What Was Done

1. **LoginPage.tsx** — Created at `src/pages/LoginPage.tsx` with email/password form, error handling, and pre-filled demo credentials.

2. **App.tsx Routes** — Added `/login` route pointing to `<LoginPage />`.

3. **Vite Proxy Fix** — Changed `env.PORT ?? "4000"` → `env.PORT || "4000"` in `vite.config.ts` to handle empty PORT in `.env.local`. Previously the proxy targeted port 80 instead of 4000.

4. **AuthContext HMR** — Extracted `useAuth` from `src/contexts/AuthContext.tsx` → `src/hooks/useAuth.ts` for Vite Fast Refresh compatibility. Updated all 10+ consumer files.

5. **Security Fixes:**
   - Added `.env.vercel` to `.gitignore`
   - Removed `api/debug.ts` (leaked environment secrets)

---

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | `curl localhost:5173/api/v1/health` → 200 | ✅ |
| AC2 | Login through proxy returns JWT token | ✅ |
| AC3 | Only ONE concurrently process | ✅ |
| AC4 | No zombie tsx/node processes | ✅ |
| AC5 | AuthContext HMR compatible | ✅ |
| — | Playwright E2E (6 tests) | ✅ 6/6 |

---

## Commits

```
233c923 fix: security - gitignore .env.vercel and remove api/debug.ts
8566cf5 fix: resolve test failures - timezone-safe nextWeekday and resilient review test
016df4b docs: update ticket-001 with implementation notes
a3f5b96 fix: ticket-001 — Vite proxy 500 + AuthContext HMR + process cleanup
```
