# Problem

Playwright `fill()` and `click()` do not consistently trigger React controlled component state or synthetic event handlers:

- `fill()` on inputs with `value` + `onChange` (React controlled pattern) does not always update React state.
- `click()` on `<button>` elements containing SVG icon children does not always bubble to React's event delegation.
- `waitUntil: "networkidle"` in SPAs causes frequent timeouts due to long-lived API polling.

Future AI agents waste significant time debugging these interactions, trying different selector strategies, and guessing why form submission succeeds via `page.evaluate()` but not via Playwright's high-level APIs.

# Improvement Needed

Document Playwright/React compatibility patterns in `.clinerules` or project docs:

- When `fill()` fails on controlled inputs, use native value setter + `dispatchEvent(new Event("input", { bubbles: true }))` via `page.evaluate()`.
- When `click()` fails on buttons with SVG children, use `document.querySelector(...).click()` via `page.evaluate()`.
- Prefer `waitUntil: "load"` over `"networkidle"` for SPA applications.
- Prefer direct API login + token injection over UI form interaction where the form isn't the thing being tested.

# Expected Result

Future AI agents should reach for the `page.evaluate()` workaround immediately instead of spending 15+ minutes debugging Playwright-React interaction issues.
