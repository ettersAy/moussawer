# AI Agent Usage Guide for Developers

This guide explains how to query the AI assistant when adding new features in Moussawer. Follow the exact steps and file conventions to keep the workflow consistent and machine- and human-readable.

## 1. Start with mission metadata

1. Open `.ai/mission-backend.md` for server features, or `.ai/mission-frontend.md` for UI features.
2. Add a new mission block at the end with:
   - `mission-id`: unique (e.g. `MP-0003`)
   - `status`: `draft`
   - `title`: concise description
   - `requirements`: itemized feature requests
   - `acceptance_criteria`: tests and outcomes

Example:
```markdown
# Mission Backend

- mission-id: MP-0003
- status: draft
- title: Login flow for admins with redirect to dashboard

## Requirements
1. `POST /api/auth/login` with email/password.
2. Validate credentials and generate token.
3. Only users with role `admin` get `/dashboard` route.
4. On failure return 401 + message.

## Acceptance Criteria
- New route in `routes/api.php`.
- `AuthController` + `LoginRequest` + tests in `tests/Feature/AuthLoginTest.php`.
- 200 + token on success.
- 403 for non-admin users trying to reach dashboard.
```

## 2. Query the AI agent with a structured prompt

Use the AI query structure below (comment in codebase and in PR descriptions):

```text
AI task: MP-0003
Goal: Create secure admin login interface with dashboard redirect
Context: Existing app has `app/Http/Controllers/Api/Public/ContactSubmissionController.php` and `app/Services/ContactService.php`.
Requirements:
  - backend login endpoints and request validation
  - frontend Vue login form and auth store
  - redirect to `/admin/dashboard` after successful admin login
  - non-admin remains forbidden
Output:
  - file list and changes
  - PHPUnit feature tests
  - Playwright test for login+redirect
```

## 3. Modify files in the workflow order

1. `.ai/mission-backend.md` / `.ai/mission-frontend.md` (mission tracking)
2. `app/Http/Controllers/Api/AuthController.php` (new controller)
3. `app/Http/Requests/LoginRequest.php` (validation)
4. `app/Services/AuthService.php` (login business logic)
5. `routes/api.php` (route definitions)
6. `app/Http/Resources/UserResource.php` (response shape)
7. `resources/js/views/public/LoginView.vue` (form UI)
8. `resources/js/stores/auth.js` (Pinia store)
9. `resources/js/router/index.js` (guard + redirect)
10. Tests: `tests/Feature/AuthLoginTest.php`, `e2e/tests/auth/login.spec.js`

## 4. Keep the branch and commit conventions

- Branch: `feature/ai/auth-login-admin`.
- Commit: `feat(ai): admin login + dashboard redirect (MP-0003)`.
- PR title: `[MP-0003] Admin login flow`.

## 5. Example for future dev query text (straight to AI)

> "Implement admin authentication with secure password checking and dashboard redirect. If the logged-in user is not admin, reject access. Use existing API resources and policies. Include tests under `tests/Feature` and `e2e/tests/auth`."

## 6. Mark mission complete when done

In `.ai/mission-backend.md` or `.ai/mission-frontend.md` set `status: done` and add a short summary of changes.

---

### Notes
- If feature touches both backend and frontend, create missions in both `.ai/mission-backend.md` and `.ai/mission-frontend.md` and cross-ref with IDs.
- Keep `.ai/context.md` updated when adding shared assumptions or new global constraints.
