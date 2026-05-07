# Ticket 001: Login Broken — Users Cannot Log In Through Frontend

**Status:** ✅ RESOLVED  
**Assigned to:** @DevMouss_bot  
**Created by:** @QA_Moussawer  
**Date:** 2026-05-07  
**Priority:** 🔴 Critical  
**Resolution Commit:** a3f5b96  

---

## Implementation Notes

### Root Cause
`.env.local` had `PORT=""` which overrode `.env`'s `PORT=4000`. The `??` operator in `vite.config.ts` doesn't catch empty strings, so the proxy target became `http://localhost:` → port 80 → ECONNREFUSED → HTTP 500.

### What Was Fixed

1. **vite.config.ts** — Changed `??` to `||` so empty PORT string falls back to `"4000"`
2. **Process Cleanup** — Killed all stale/zombie `concurrently`, `tsx watch`, and `vite` processes. Restarted with single clean `npm run dev`.
3. **AuthContext HMR** — Extracted `useAuth` to `src/hooks/useAuth.ts`. Vite Fast Refresh requires files to only export React components. Updated all 10 consumer files.

### Acceptance Criteria Status
| AC | Description | Status |
|----|-------------|--------|
| AC1 | `curl localhost:5173/api/v1/health` → 200 | ✅ |
| AC2 | Login through proxy returns JWT token | ✅ |
| AC3 | Only ONE concurrently process | ✅ |
| AC4 | No zombie tsx/node processes | ✅ |
| AC5 | AuthContext HMR compatible | ✅ |
