# Ticket 001 — QA Test Report (FRESH RE-TEST)

**Tested by:** @QAMouss_bot  
**Date:** 2026-05-07 (fresh re-test per /start)  
**Ticket:** ticket-001 — Add Login Page  
**Status:** ❌ QA FAILED

---

## Test Results

### AC1: Vite proxy health check
**Status:** ✅ PASS

```
$ curl -s http://localhost:5173/api/v1/health
{"data":{"status":"ok","service":"moussawer-api","version":"v1","commit":"233c923"}}
```

HTTP 200 with valid JSON. Proxy correctly forwards to API on port 4000.

### AC2: Login through Vite proxy returns JWT token
**Status:** ✅ PASS

| Scenario | Result |
|----------|--------|
| Client login (`client@example.com` / `password`) | ✅ 200 + JWT + user object |
| Admin login (`admin@example.com` / `password`) | ✅ 200 + JWT + user object |
| Photographer login (`photographer-one@example.com` / `password`) | ✅ 200 + JWT + user object |
| Bad password (`client@example.com` / `wrongpassword`) | ✅ 401 `INVALID_CREDENTIALS` |
| Empty body `{}` | ✅ 400 `VALIDATION_ERROR` — both fields required |
| Missing password | ✅ 400 `VALIDATION_ERROR` — `password: Required` |
| Missing email | ✅ 400 `VALIDATION_ERROR` — `email: Required` |
| Invalid JSON body | ✅ 500 `INTERNAL_ERROR` (graceful, not a crash) |

All roles authenticate successfully. Error cases handled gracefully with proper validation.

### AC3: Only ONE `concurrently` process running
**Status:** ✅ PASS

```
PID 219290: sh -c concurrently -n api,web ...
PID 219291: node .../concurrently -n api,web ...
```

Single logical concurrently instance (shell wrapper + node process). Children: `tsx watch` and `vite`. Clean.

### AC4: No zombie tsx/node processes
**Status:** ✅ PASS

- One defunct `zsh` process (PID 236016) — unrelated shell artifact from telegrame-claude bot, NOT from moussawer app
- App process tree clean: all children properly parented under concurrently
- No orphaned tsx, vite, or node processes belonging to the app

### AC5: AuthContext HMR compatible (Vite Fast Refresh)
**Status:** ✅ PASS

- `useAuth` extracted from `AuthContext.tsx` → `hooks/useAuth.ts`
- `AuthContext.tsx` exports only React components (`AuthContext`, `AuthProvider`)
- All 10 consumer files import from `../hooks/useAuth` (verified by grep)
- `vite.config.ts` has `@vitejs/plugin-react` for Fast Refresh
- TypeScript compiles clean for app source code (`tsc --noEmit` excluding tests)

---

## Playwright E2E Tests
**Status:** ❌ FAIL

### Bug: Tests cannot run — broken import paths + untracked files

**Symptom:**
```
Error: Cannot find module '/srv/dev/moussawer/fixtures/auth.fixture'
  imported from /srv/dev/moussawer/tests/admin-login.spec.ts

Error: Cannot find module '/srv/dev/moussawer/fixtures/auth.fixture'
  imported from /srv/dev/moussawer/tests/smoke.spec.ts

Error: No tests found
```

**Root cause — Two issues:**

1. **Wrong import paths.** Both spec files use `../fixtures/auth.fixture` and `../pages/login.page`:
   - `tests/admin-login.spec.ts` line 1: `import ... from "../fixtures/auth.fixture"`
   - `tests/smoke.spec.ts` line 1: `import ... from "../fixtures/auth.fixture"`
   
   The `../` resolves to project root (`/srv/dev/moussawer/`), looking for `/srv/dev/moussawer/fixtures/auth.fixture` which does NOT exist. The actual files are at `tests/fixtures/auth.fixture.ts` and `tests/pages/login.page.ts`. Correct imports should be `./fixtures/auth.fixture` and `./pages/login.page`.

2. **Untracked files.** The test files are NOT committed to git:
   ```
   Untracked files:
     tests/admin-login.spec.ts
     tests/fixtures/
     tests/pages/
     tests/smoke.spec.ts
   ```
   The previous test report claimed "6/6 passed (9.6s)" but these tests cannot run in their current state. This is a regression from the previously reported passing state.

---

## Security Verification (from prior CR review)

| Issue | Severity | Status |
|-------|----------|--------|
| `.env.vercel` not in `.gitignore` | 🔴 Critical | ✅ FIXED — verified via commit `233c923` |
| `api/debug.ts` exposes environment secrets | 🔴 Critical | ✅ FIXED — file no longer exists |

---

## Additional Observations

### 🟡 State.json is out of sync
`/srv/dev/moussawer/.team-memory/state.json` shows ticket-001 as `"in-progress"` but `ticket-001.md` shows `Status: ✅ DONE` and the prior test report shows `QA PASSED`.

### 🟢 vite.config.ts fix confirmed
```ts
const apiPort = env.PORT || "4000";  // was env.PORT ?? "4000"
```
`||` correctly handles empty `PORT=""` from `.env.local`.

### 🟢 LoginPage.tsx is properly implemented
- Email/password form with controlled inputs
- Error handling with user-facing error messages
- Pre-filled demo credentials for testing
- Links to register page
- Uses extracted `useAuth` hook

---

## Summary

| AC | Criteria | Status |
|----|----------|--------|
| AC1 | `curl :5173/api/v1/health` → 200 | ✅ PASS |
| AC2 | Login through proxy returns JWT token | ✅ PASS |
| AC3 | Single concurrently process | ✅ PASS |
| AC4 | No zombie tsx/node processes | ✅ PASS |
| AC5 | AuthContext HMR compatible | ✅ PASS |
| — | Playwright E2E (6 tests) | ❌ FAIL — broken imports |

**Overall:** ❌ **QA FAILED** — 5/5 core acceptance criteria pass, but Playwright E2E tests are broken due to wrong import paths (`../` should be `./`) and untracked test files. Tests cannot run.

@DevMouss_bot see test report for ticket-001 — Playwright E2E test imports need fixing.
