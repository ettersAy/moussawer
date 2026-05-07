# Ticket 001 — Code Review

**Reviewer:** CR Moussawer  
**Date:** 2026-05-07  
**Status:** 🔴 CHANGES REQUESTED — Cannot proceed to QA yet

---

## Review Summary

I reviewed the current state of Ticket 001 (Login Broken). The ticket is **not yet fixed** — both the Vite dev server (port 5173) and the API server (port 4000) are currently **down**. The proxy 500 issue has not been resolved. Additionally, DevMouss_bot has uncommitted changes in the working tree that contain **critical security issues** that must be addressed before any deployment.

---

## Current State (as checked)

| Check | Result |
|-------|--------|
| `curl localhost:4000/api/v1/health` | ❌ Connection refused (server down) |
| `curl localhost:5173/api/v1/health` | ❌ Connection refused (server down) |
| Running `concurrently` processes | ❌ None running |
| Running `tsx watch` processes | ❌ None running |
| Ticket AC1–AC5 met | ❌ None met |

---

## Issues Found

### 🔴 CRITICAL: `.env.vercel` contains a live Vercel OIDC token and is NOT gitignored

**File:** `/srv/dev/moussawer/.env.vercel`  
**Severity:** Critical — credentials leak

The file `.env.vercel` contains a live `VERCEL_OIDC_TOKEN` JWT. Running `git check-ignore .env.vercel` confirms the file is **NOT** covered by `.gitignore`. The current `.gitignore` pattern `.env*.local` does not match `.env.vercel`.

If this file is committed and pushed, the OIDC token is leaked. This token grants access to the `moussawer` project on Vercel.

**Required fix:**
- Add `.env.vercel` (or the broader pattern `.env*`) to `.gitignore`
- OR rotate the OIDC token and ensure `.env.vercel` is never tracked

---

### 🔴 CRITICAL: `api/debug.ts` exposes environment secrets in plaintext

**File:** `/srv/dev/moussawer/api/debug.ts`  
**Severity:** Critical — information disclosure

This debug endpoint prints:
- `jwtLength` — the length of the JWT secret
- `dbUrlPrefix` — first 30 characters of the database URL
- `hasJwt`, `hasDbUrl` — boolean presence checks

Even exposing the *length* of a secret is a security problem — it narrows brute-force search space. The DATABASE_URL prefix may reveal the database host/provider. This file has no business being in the codebase in this form.

**Required fix:**
- Remove `api/debug.ts` entirely before any production deployment, or guard it behind an explicit `NODE_ENV !== "production"` check with a warning comment

---

### 🟡 MEDIUM: `server/db.ts` — global Prisma caching now unconditional

**File:** `/srv/dev/moussawer/server/db.ts`  
**Change:** Removed `if (process.env.NODE_ENV !== "production")` guard

```diff
-if (process.env.NODE_ENV !== "production") {
-  globalForPrisma.prisma = prisma;
-}
+globalForPrisma.prisma = prisma;
```

This is actually a **correct fix** for a long-running server — without caching in global, hot-reloading `tsx watch` creates a new PrismaClient on every restart, exhausting database connections. However, for serverless (Vercel), each invocation gets a fresh global, so this is fine either way.

**Verdict:** Acceptable — this is a legitimate fix, not a bug.

---

### 🟢 MINOR / GOOD: `server/services/resources.ts` — null-safe rating

**File:** `/srv/dev/moussawer/server/services/resources.ts`

```diff
-rating: Number(photographer.rating.toFixed(1)),
+rating: photographer.rating != null ? Number(Number(photographer.rating).toFixed(1)) : 0,
```

Good defensive fix — prevents a crash when `rating` is null. **Approved.**

---

### 🟢 MINOR: `package.json` — added `prisma generate` to build

Adding `prisma generate` before `tsc --noEmit` ensures the Prisma client types exist before type-checking. This is a correct build order fix. **Approved.**

---

### 🟡 NOTE: `vercel.json` rewrites may conflict with API routing

The Vercel rewrite rule is:
```json
{ "source": "/api/(.*)", "destination": "/api" }
```

This captures ALL `/api/*` requests and sends them to the Vercel function at `/api` (which runs `api/index.mjs`). This means the Express app handles routing internally — that's by design and should work. **No action needed** unless 404s appear on sub-routes in production.

---

## What Still Needs to Be Done (Ticket 001)

The actual ticket is **not resolved**. DevMouss_bot must:

1. **Kill all stale processes** and restart with a single `npm run dev`
2. **Diagnose why the Vite proxy returns 500** — the proxy config in `vite.config.ts` looks correct, so the issue may be:
   - Port conflicts from duplicate processes
   - A Vite internal error (check Vite terminal output)
   - A networking issue (IPv4 vs IPv6 binding)
3. **Verify AC1–AC5** from the ticket
4. **Fix the security issues** flagged above before any commit

---

## Verdict

**🔴 CHANGES REQUESTED.** @DevMouss_bot must:

1. Fix the `.env.vercel` gitignore issue (CRITICAL)
2. Remove or guard `api/debug.ts` (CRITICAL)
3. Restart the dev servers and fix the Vite proxy 500 (the actual ticket)
4. Verify all 5 acceptance criteria pass

After these are resolved, @QAMouss_bot should re-test and mark QA PASSED before I do the final review.

---

**Next step:** Back to @DevMouss_bot for fixes.
