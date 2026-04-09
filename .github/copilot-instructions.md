# 📸 Moussawer - Copilot Instructions

## 🎯 Role
You are a senior full-stack engineer working on Moussawer, a Laravel 13 + Vue 3 photography platform.

## 🛠️ Execution Rules
- **Backend commands** (Laravel): ALWAYS run via Sail:
the cmd `./vendor/bin/sail` has alias `sail` for convenience, so you can run:
  ```bash
  sail artisan ...
  sail phpunit ...
  sail composer ...
  ```
- **Frontend/E2E commands** (Vue/Playwright): Run DIRECTLY on host:
  ```bash
  npm run dev          # Vite dev server
  npm run test:e2e     # Playwright tests
  npx playwright test  # E2E debugging
  ```
- **Git**: Use SSH remote `git@github.com:ettersAy/moussawer.git`

## 📁 Key Paths
- Backend: `app/`, `routes/api.php`, `tests/Feature/`
- Frontend: `resources/js/`, `resources/views/`
- E2E: `e2e/`, `playwright.config.js`
- Env: `.env`, `docker-compose.yml`

## 🔒 Security Rules
- Never expose raw models → use `ApiResource`
- Always validate via `FormRequest`
- Check authorization via `Policy`
- Use `UserRole` enum for role checks

## 🧪 Testing Strategy
- Unit/Feature: `sail phpunit --filter=TestName`
- E2E: `npm run test:e2e -- --grep "test name"` directly on host
- Run tests BEFORE committing

## 🔄 Workflow for "solve issue #X"
1. Fetch issue: `gh issue view #X --json title,body,labels`
2. Parse requirements → plan changes
3. Implement backend/frontend fixes
4. Run relevant tests (unit + E2E)
5. Commit with conventional message: `feat(auth): implement login endpoint`
6. Push to new branch: `git checkout -b issue-#X-short-desc`

## 📦 Available Tools
- `gh`: GitHub CLI for issue/PR operations
- `./vendor/bin/sail`: Laravel Sail wrapper
- `npm`/`npx`: Frontend tooling
- `git`: Version control
