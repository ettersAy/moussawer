# Playwright & TypeScript Audit Report

**Generated:** 2026-05-07  
**Audited by:** DevMouss_bot  
**Scope:** All Playwright-related test code under `/srv/dev/moussawer/`

---

## 1. Overview

This report audits the Playwright end-to-end test code in the Moussawer project against Playwright and TypeScript best practices (Playwright v1.59+, TypeScript 5.8+). The audit covers:

| File | Type | Framework |
|---|---|---|
| `playwright.config.ts` | Configuration | `@playwright/test` |
| `tests/admin-login.spec.ts` | E2E Test Spec | `@playwright/test` |
| `tests/smoke-test.js` | Standalone Smoke Script | Raw Playwright API |

---

## 2. Findings Summary

| Category | Critical | Major | Minor | Info |
|---|---|---|---|---|
| Configuration | 1 | 4 | 3 | 2 |
| Test Spec (admin-login.spec.ts) | 1 | 6 | 5 | 3 |
| Smoke Test (smoke-test.js) | 2 | 3 | 1 | 1 |
| Project Structure | 0 | 2 | 3 | 2 |
| **Total** | **4** | **15** | **12** | **8** |

---

## 3. Detailed Findings

### 3.1 `playwright.config.ts`

#### 🔴 Critical

| ID | Finding | Best Practice Violated |
|---|---|---|
| CFG-01 | **Only Chromium is tested.** `projects` array contains only `chromium`. | Playwright recommends testing on all supported browsers (Chromium, Firefox, WebKit) for cross-browser coverage. |

#### 🟠 Major

| ID | Finding | Best Practice Violated |
|---|---|---|
| CFG-02 | **`fullyParallel: false`** — Tests run sequentially within a file. | Best practice: `fullyParallel: true` significantly speeds up test suites. |
| CFG-03 | **No `webServer` configured.** The dev server must be started manually before tests. | Playwright's `webServer` config auto-starts/auto-stops the server, eliminating manual setup. |
| CFG-04 | **No `globalSetup` / `globalTeardown`.** No auth state setup, DB seeding, or cleanup. | Global setup can authenticate once and save `storageState`, avoiding per-test login overhead. |
| CFG-05 | **`reporter: "list"` only.** No HTML report, no JUnit XML for CI. | Best practice: use multiple reporters (e.g., `[['html'], ['junit', { outputFile: 'results.xml' }]]`). |

#### 🟡 Minor

| ID | Finding | Best Practice Violated |
|---|---|---|
| CFG-06 | **`retries: 0`** — No retries, even in CI. | CI should have `retries: 1-2` to handle flakiness. |
| CFG-07 | **Missing `use.screenshot` and `use.video`.** Only `trace` is configured. | Add `screenshot: 'only-on-failure'`, `video: 'on-first-retry'` for debugging. |
| CFG-08 | **No `outputDir`** — results scattered across defaults. | Define explicit output directory for test artifacts. |

#### ℹ️ Info

| ID | Finding |
|---|---|
| CFG-09 | `expect.timeout: 10_000` and `timeout: 30_000` are reasonable defaults. |
| CFG-10 | `testMatch: "**/*.spec.ts"` correctly scopes only Playwright files (vitest picks up `*.test.ts`). Good separation. |

---

### 3.2 `tests/admin-login.spec.ts`

#### 🔴 Critical

| ID | Finding | Best Practice Violated |
|---|---|---|
| SPEC-01 | **No Page Object Model (POM).** All locators and actions are repeated inline across tests. Login flow is duplicated 5 times verbatim. | Playwright [recommends POM](https://playwright.dev/docs/pom) to reduce duplication, improve maintainability, and make tests resilient to UI changes. |

#### 🟠 Major

| ID | Finding | Best Practice Violated |
|---|---|---|
| SPEC-02 | **CSS class-based locator:** `page.locator('.form-error')`. | Playwright [best practices](https://playwright.dev/docs/best-practices) say: "prefer user-facing attributes to XPath or CSS selectors." Use `getByRole` or `getByText` instead. |
| SPEC-03 | **Hardcoded credentials** (`ADMIN_EMAIL`, `CLIENT_EMAIL`, `PASSWORD`) inline in the test file. | Credentials should come from environment variables (e.g., `process.env.TEST_ADMIN_EMAIL`) or a config file. |
| SPEC-04 | **Login via UI repeated in every test.** Each test navigates to `/login`, fills credentials, clicks login, waits for redirect. | Playwright recommends [authentication via API](https://playwright.dev/docs/auth) using `storageState` or `request` fixture — much faster and more reliable. |
| SPEC-05 | **Overuse of `waitForLoadState('networkidle')`** — called after every `page.goto()`. | Playwright [discourages `networkidle`](https://playwright.dev/docs/api/class-page#page-wait-for-load-state) as it waits for 500ms of no network activity — unreliable with polling/streaming. Playwright's auto-waiting already handles most cases. |
| SPEC-06 | **`waitForTimeout(1500)`** hardcoded wait in the "non-admin cannot access /admin" test. | Hardcoded waits are fragile and slow. Use `expect(page).toHaveURL(...)` with a timeout, or `waitForURL`. |
| SPEC-07 | **No custom fixture for authenticated state.** Every test manually clears localStorage and logs in from scratch. | Create an `authenticatedPage` fixture via `test.extend()` that provides a pre-authenticated page. |

#### 🟡 Minor

| ID | Finding | Best Practice Violated |
|---|---|---|
| SPEC-08 | **No `test.step()` usage.** All assertions are flat in the test body. | `test.step()` improves reporting readability in HTML/UI reporters. |
| SPEC-09 | **Missing `test.info()` annotations / attachments.** No screenshots attached on failure. | Use `test.info().attach()` to capture debug info. |
| SPEC-10 | **No test tagging** (e.g., `@smoke`, `@regression`). | Tags allow selective test runs: `npx playwright test --grep @smoke`. |
| SPEC-11 | **No disabled-input / form validation tests.** Missing: empty email, empty password, invalid email format, password visibility toggle. | Edge case coverage is important for login flows. |
| SPEC-12 | **Only admins tested.** No tests for photographer or client login flows, registration, password reset, etc. | Test coverage is narrow — only admin login path is covered. |

#### ℹ️ Info

| ID | Finding |
|---|---|
| SPEC-13 | Good use of `getByRole` locators for most elements. |
| SPEC-14 | Good use of `getByLabel` for password field. |
| SPEC-15 | Good structure using `test.describe` and `test.beforeEach`. |

---

### 3.3 `tests/smoke-test.js`

#### 🔴 Critical

| ID | Finding | Best Practice Violated |
|---|---|---|
| SMOKE-01 | **Not using `@playwright/test` framework.** This is a standalone script with a raw `async (page) => {}` function. No fixtures, no auto-waiting expectations, no reporting. | All Playwright tests should use `@playwright/test` for consistency, fixtures, retries, CI integration, and reporting. |
| SMOKE-02 | **JavaScript, not TypeScript.** Loses all type safety, autocompletion, and refactoring support. | The project uses TypeScript everywhere else. Playwright has first-class TS support — spec files should be `.spec.ts`. |

#### 🟠 Major

| ID | Finding | Best Practice Violated |
|---|---|---|
| SMOKE-03 | **Custom `check()` assertion function** instead of Playwright's `expect`. | Playwright's `expect` provides auto-retry, web-first assertions, and rich reporting. |
| SMOKE-04 | **`page.evaluate()` used for login** — bypasses UI and uses `fetch()` directly. | Should use Playwright's [auth guide](https://playwright.dev/docs/auth) patterns: `request` fixture or `storageState`. |
| SMOKE-05 | **Hardcoded `BASE = "http://localhost:4000"`** instead of using config's `baseURL`. | Duplicates configuration; fragile if port changes. |

#### 🟡 Minor

| ID | Finding | Best Practice Violated |
|---|---|---|
| SMOKE-06 | **Multiple `waitForTimeout()` calls** (500ms, 1000ms, 1500ms). | Hardcoded waits are fragile and make tests unnecessarily slow. |

#### ℹ️ Info

| ID | Finding |
|---|---|
| SMOKE-07 | Covers broader flow than `admin-login.spec.ts` (homepage, redirects, role-based nav, logout). |

---

### 3.4 Project Structure & Tooling

#### 🟠 Major

| ID | Finding | Best Practice Violated |
|---|---|---|
| STR-01 | **No `eslint-plugin-playwright`** installed. | The official `eslint-plugin-playwright` enforces best practices: no hardcoded waits, no `page.$()`, prefer `getByRole`, etc. |
| STR-02 | **No CI pipeline for E2E tests.** No GitHub Actions (or similar) workflow to run Playwright tests. | E2E tests are most valuable in CI. Without CI, they're likely to bitrot. |

#### 🟡 Minor

| ID | Finding |
|---|---|
| STR-03 | **No dedicated Playwright `tsconfig`.** The main `tsconfig.json` includes `tests/` which mixes vitest and Playwright types. Consider a `tsconfig.e2e.json`. |
| STR-04 | **No `test-results/` in `.gitignore`** (though `playwright-report/` is there). Ensure `test-results/` is gitignored. |
| STR-05 | **No Playwright-specific npm scripts** beyond `test:e2e`. Consider adding `test:e2e:ui`, `test:e2e:debug`, `test:e2e:headed`. |

#### ℹ️ Info

| ID | Finding |
|---|---|
| STR-6 | Vite config correctly excludes `.spec.ts` from vitest via `exclude: ["**/*.spec.{ts,js,mjs,cjs,tsx,jsx}"]`. Good separation. |
| STR-7 | `@playwright/test` is installed at latest version (^1.59.1). |

---

## 4. Severity Definitions

| Level | Meaning |
|---|---|
| 🔴 Critical | Violates a core Playwright best practice; causes test fragility, slowness, or missing coverage. |
| 🟠 Major | Significantly reduces maintainability or reliability; should be fixed in current sprint. |
| 🟡 Minor | Improvement that enhances quality but is not blocking. |
| ℹ️ Info | Observation; no action required. |

---

## 5. Risk Assessment

| Risk | Likelihood | Impact |
|---|---|---|
| Tests become unmaintainable as test suite grows (no POM) | High | High |
| Flaky tests due to `networkidle` and `waitForTimeout` | High | Medium |
| Credentials leaked in source code | Medium | High |
| Slow test execution due to UI-based login per test | High | Medium |
| Missing cross-browser bugs (only Chromium tested) | Medium | Medium |
| No CI integration → tests not run regularly | High | High |
| Smoke test diverges from Playwright test framework | High | Medium |
