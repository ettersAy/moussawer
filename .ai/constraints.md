# AI Constraints

- Do not change dependency versions (Laravel 13, Vue 3, etc.).
- All code changes need tests (PHPUnit for backend, Playwright for E2E, existing frontend test patterns).
- Always use Sail commands for local execution (`vendor/bin/sail`).
- Avoid modifying core frameworks or unrelated vendor code.
- Keep responses and files concise; this repo is small and focused.
