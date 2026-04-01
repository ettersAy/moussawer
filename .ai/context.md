# AI Context (canonical)

This file is the single source of truth for the agent's global context in the Moussawer project.

## Project
- Laravel 13 backend, Vue 3 frontend (Pinia, Vite), Docker Sail, MySQL.
- API-first architecture with role-based controllers and Services.
- UI has role views: admin/client/photographer/public.

## Conventions
- Use `app/Services/*` for business logic.
- Authorization through policies in `app/Policies`.
- Validation via Form Requests in `app/Http/Requests`.
- API responses via resources in `app/Http/Resources`.
- Testing with PHPUnit (`tests/Feature`, `tests/Unit`) and Playwright (`e2e/tests`).

## Routes
- `routes/api.php` for all JSON endpoints.
- `routes/web.php` for SPA fallback.

## Focus
- Always keep controllers thin.
- Keep `.ai/` docs up-to-date with active backlog `mission-*` entries.
