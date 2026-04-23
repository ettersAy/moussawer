# Moussawer — Quickstart (≤100 lines)

## Stack
PHP 8.5 / Laravel 13 / Vue 3 / Tailwind v4 / MySQL 8 / Sail (Docker)

## Workflow (MANDATORY)
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/ai/[mission-id]`
3. Implement → Write tests → `sail artisan test --compact` → `sail bin pint --dirty --format agent`
4. Provide manual testing guide → Commit → Push → Create PR

## Backend Patterns
- **Controller → Service → Resource**: Controllers handle HTTP+auth, Services hold business logic, Resources transform models.
- **Form Requests**: Validate + authorize in one class. Never validate in controller.
- **Policies**: Authorize by role+ownership. Register in AuthServiceProvider.
- **Enums**: Backed enums with `label()`, `canTransitionTo()`. Cast in model: `$casts = ['status' => BookingStatus::class]`.
- **Routes**: Public → `prefix('public')`, Auth → `middleware('auth:sanctum')`, Role → `prefix('client')->middleware('role:client')`.
- **Sail**: All commands prefixed with `sail`. Node commands run on host.

## Frontend Patterns (STRICT)
- **No CSS in Vue `<style>` blocks**. Extract to `resources/css/components/[name].css` or `resources/css/views/[name].css`.
- **No fat components** (>150 lines). Decompose into composables + sub-components.
- **Composables** for API calls + state: `composables/useBookings.js`.
- **Pinia stores** for cross-component shared state only (auth, booking).
- **Router**: Lazy-loaded routes with `meta: { layout, requiresAuth, requiresGuest }`.
- **Imports**: Use `@/` aliases.

## CSS Architecture
- `resources/css/app.css` imports all modules (base → utilities → components → layouts → roles → views).
- BEM-lite naming: `.card`, `.card__header`, `.card--featured`.
- **20-line rule**: CSS >20 lines MUST go in a `.css` file, never in Vue `<style scoped>`.

## Testing
- **PHPUnit**: `sail artisan test --compact`. Test success, failure, auth, validation, DB state.
- **Playwright E2E**: `npx playwright test`. Use Page Object Model + fixtures + API mocking.
- **Cover**: happy path, failure path, edge cases, role-based access.

## Booking System
- Status lifecycle: `pending → confirmed → completed` or `pending/confirmed → cancelled`.
- Photographer unavailable → 409. Invalid transition → 422. Past date → 422.
- Client creates own bookings. Photographer manages assigned. Admin manages all.

## Key Gotchas
| Issue | Fix |
|-------|-----|
| `sail: command not found` | Add sail function to `~/.zshenv` + `~/.zshrc` |
| Vite manifest error | Run `npm run build` |
| Tinker shows enum object | Use `->value` |
| Photographer relation null | Check `$user->photographer` exists first |
| Playwright X display error | Set `headless: true` |
| Auth store not picking up | `await page.reload()` after setting localStorage |

## Test Accounts
| Email | Role | Password |
|-------|------|----------|
| test@example.com | Client | password |
| admin@example.com | Admin | password |
| photographer-one@example.com | Photographer | password |
