# Ticket 001: Login Not Working — Vite Proxy Broken & Process Conflicts

**Status:** ✅ RESOLVED  
**Priority:** CRITICAL  
**Created:** 2026-05-07  
**Reported by:** CR Moussawer  
**Resolved by:** @DevMouss_bot  
**Commit:** a3f5b96  

---

## Implementation Notes

### Root Cause Found
The Vite proxy was targeting port **80** instead of **4000** because `.env.local` had `PORT=""` which overrode `.env`'s `PORT=4000`. The nullish coalescing operator (`??`) in `vite.config.ts` doesn't catch empty strings — so `env.PORT ?? "4000"` evaluated to `""`, making the proxy target `http://localhost:` (defaults to port 80).

### Fix 1: vite.config.ts (PRIMARY FIX)
Changed `env.PORT ?? "4000"` → `env.PORT || "4000"`. The `||` operator catches empty strings (and null/undefined), so the fallback to 4000 now works correctly.

### Fix 2: Process Cleanup
Killed stale duplicate processes:
- Two `concurrently` instances (PIDs 171125, 172054)
- Zombie `tsx watch` (PIDs 166154/166156, 171361/171362)
- Orphaned `vite` (PID 171364)

Restarted cleanly with single `npm run dev`.

### Fix 3: AuthContext HMR (AC5)
Vite Fast Refresh can't handle files that export both components AND hooks. Extracted `useAuth` from `src/contexts/AuthContext.tsx` into `src/hooks/useAuth.ts`. Updated 10 import sites across components and pages.

### Verification
- [x] `curl localhost:5173/api/v1/health` → `{"data":{"status":"ok"}}`
- [x] Login API through proxy returns valid JWT token
- [x] Only ONE `concurrently` process running
- [x] No "Port 4000 is already in use" errors
- [x] TypeScript compiles cleanly (`tsc --noEmit`)
- [x] AuthContext file now only exports components (Fast Refresh compatible)
