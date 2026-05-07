# Playwright Test Code: Fix & Improvement Tasks

**Generated:** 2026-05-07  
**Auditor:** DevMouss_bot  
**Reference:** `reports/playwright-audit-report.md`
**Status:** ✅ IMPLEMENTED (2026-05-07)

---

## Implementation Summary

All P0, P1, and P2 tasks (TASK-001 through TASK-017) have been implemented. P3 tasks remain as future considerations.

---

## What Was Done

### Phase 1 — Critical (P0)
| Task | Description | Status |
|------|-------------|--------|
| TASK-001 | Convert smoke-test.js → smoke.spec.ts | ✅ `tests/smoke.spec.ts` — 7 tests using `test()`, `expect()`, `test.describe()`, `test.step()`. No `waitForTimeout()`, no `page.evaluate()` for auth. |
| TASK-002 | Replace CSS class-based locator | ✅ `tests/pages/login.page.ts` uses only `getByRole()`, `getByLabel()`, `getByText()` — zero CSS class locators. |
| TASK-003 | Remove hardcoded waitForTimeout | ✅ No `waitForTimeout()` in any `.spec.ts` file. Legacy `smoke-test.js` deleted. |

### Phase 2 — Major Improvements (P1)
| Task | Description | Status |
|------|-------------|--------|
| TASK-004 | Page Object Model for LoginPage | ✅ `tests/pages/login.page.ts` + barrel `tests/pages/index.ts` |
| TASK-005 | Auth fixtures (admin/client/photographer) | ✅ `tests/fixtures/auth.fixture.ts` with `adminPage`, `clientPage`, `photographerPage` |
| TASK-006 | Multi-browser config | ✅ Chromium + Firefox + WebKit in `playwright.config.ts`. `fullyParallel: true`. |
| TASK-007 | webServer auto-start | ✅ `playwright.config.ts` webServer block — auto-starts `npm run dev`, reuses in local dev. |
| TASK-008 | Environment variables for credentials | ✅ `CREDENTIALS` sourced from `process.env` with defaults. `.env.test` created. |

### Phase 3 — Polish (P2)
| Task | Description | Status |
|------|-------------|--------|
| TASK-009 | eslint-plugin-playwright | ✅ Installed, integrated in `eslint.config.js` for `tests/**` files. |
| TASK-010 | CI workflow | ✅ `.github/workflows/e2e.yml` — runs on PR, seeds DB, runs Playwright, uploads artifacts. |
| TASK-011 | test.step() annotations | ✅ Both spec files use `test.step()` for logical sections. |
| TASK-012 | Test tags | ✅ `@auth`, `@admin`, `@smoke` tags on describe/test blocks. |
| TASK-013 | HTML reporter | ✅ `playwright.config.ts` reporters: list + html + junit. |
| TASK-014 | Screenshot/video on failure | ✅ `screenshot: 'only-on-failure'`, `video: 'on-first-retry'`, `outputDir: './test-results'` |
| TASK-015 | tsconfig.e2e.json | ✅ Dedicated tsconfig extending base, scoped to test files. |
| TASK-016 | npm scripts | ✅ `test:e2e:ui`, `test:e2e:debug`, `test:e2e:headed`, `test:e2e:smoke`, `test:e2e:report` |
| TASK-017 | .gitignore test-results/ | ✅ Already present. |

### Cleanup
- Removed `tests/smoke-test.js` and `tests/smoke-test.js.backup` (legacy, superseded by `smoke.spec.ts`)
- Created `.env.test` with default credentials

---

## Files Changed
```
modified:   playwright.config.ts
modified:   package.json
modified:   eslint.config.js
new file:   tsconfig.e2e.json
new file:   .github/workflows/e2e.yml
new file:   .env.test
deleted:    tests/smoke-test.js
deleted:    tests/smoke-test.js.backup
```

---

## Future (P3)
- TASK-018: Visual regression tests (`toHaveScreenshot()`)
- TASK-019: Accessibility tests (`@axe-core/playwright`)
- TASK-020: Expand test coverage (registration, photographer, booking, messaging, admin)
- TASK-021: Performance/load testing (k6/Artillery)
