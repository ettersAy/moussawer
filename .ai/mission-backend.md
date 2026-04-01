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