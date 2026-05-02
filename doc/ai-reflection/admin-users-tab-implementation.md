# Reflection: Admin Users Tab Implementation (2026-05-02)

## Discovery Bottlenecks

- `userResource` in `resources.ts` shares a type (`PhotographerProfileShape`) with `auth.routes.ts` — changing it broke auth registration flow. Should audit all callers before modifying shared resource types.
- `pagination()` utility already exists in `server/utils/http.ts` but was discovered late; could have been reused instead of inline pagination in admin route.
- `includes.ts` has separate `userInclude` with minimal photographer profile select — any expansion of `userResource` fields requires updating both `includes.ts` and `resources.ts` in sync.
- `StatusBadge.tsx` already supports `DISABLED` tone (`tone-danger`) — no CSS change needed for new status.

## Repeated Searches / Wasted Time

- Searched for `userInclude` location multiple times across routes/ and services/ directories.
- Searched for `PhotographerProfile` Prisma fields multiple times to verify which fields exist on the model.
- Checked `auth.routes.ts` only after compilation error — should have grepped for `userResource` callers before changing the type signature.

## Missing Documentation / Rules

- `.clinerules` does not document the shared type dependency between `resources.ts` and `auth.routes.ts`.
- No documented convention about where to add new admin CSS (admin.css vs tables.css vs dedicated file).
- The relationship between `includes.ts` (Prisma include objects), `resources.ts` (serializers), and route handlers is undocumented — new agents must reverse-engineer this.
- No index/registry of existing reusable utilities (`pagination()`, `ok()` meta support, `AppError` patterns).

## Automation Opportunities

- Grepping for all callers of a shared type before modifying it could be automated with a pre-check script.
- Repeated `tsc --noEmit` compilations during development suggest a watch mode would be faster.
- Database reset (`db:reset`) runs on every `npm test` — an incremental test mode would speed iteration.
- Checking which CSS files exist and their purposes required manual directory listing — a project index would help.

## Hidden Conventions

- `userResource` in `resources.ts` uses a manually defined `UserShape` type instead of Prisma-generated types — fragile when schema changes.
- API response helper `ok(res, data, meta)` accepts optional third param for pagination meta — not documented in the function signature.
- CSS class naming uses BEM-like patterns but not strict BEM (e.g., `users-toolbar`, `search-wrapper`).
- All new admin panel features go in `src/pages/admin/` as standalone tab components — good pattern to follow.
