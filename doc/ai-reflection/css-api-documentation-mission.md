# Reflection: CSS Convention Index + API Utility + Resource Architecture Documentation

## What Slowed Discovery

- All 17 CSS files had to be individually read to determine their scope. No file-level header comments exist in any CSS file. Future agents should add brief `/* Purpose: ... */` comments at the top of each CSS file.
- The dependency chain between `includes.ts`, `resources.ts`, and route handlers was implicit—had to trace imports across 11 route files + helpers.ts to build the mapping table. A documented index at the top of each file (now added) would have saved this scan.
- Some resource functions (`serviceResource`, `portfolioResource`, `messageResource`, `conversationResource`) use inline Prisma includes in route handlers rather than shared includes from `includes.ts`. This inconsistency was not documented anywhere.

## What Was Confusing

- `PhotographerProfileShape` type in `resources.ts` is defined locally and must match the `select` in `userInclude`'s `photographerProfile` field, but there is no type-level enforcement linking them. A type mismatch would compile but return undefined fields at runtime.
- `helpers.ts` re-exports include usage patterns (e.g., `requirePhotographerProfile` uses `photographerInclude` internally) — route callers don't always know which include is being used under the hood. When expanding a resource function, you must check helpers.ts too.

## Repeated Searches

- Grep'd 3 times for `from "../services/resources"` — once to find callers, once to verify, once for the audit script.
- Read `helpers.ts` twice — once for understanding route patterns, once to verify which includes it re-exports.

## Documentation Gaps Found

- `includes.ts` had no header comment (now fixed).
- `resources.ts` had no header comment (now fixed).
- No single document explained the Route → Include → Resource tri-layer pattern (now in `.clinerules`).
- API response envelope shapes were documented in `doc/API.md` but not referenced from `.clinerules` (now fixed).
- No convention existed for where to place new admin CSS (now in `.clinerules` + `css-convention-index.md`).
- `PhotographerProfileShape` vs `photographerInclude` coupling is undocumented — remains a silent-break risk.

## Automation Insights

- The audit script (`scripts/audit-resource-callers.sh`) covers caller discovery but cannot validate that a resource function's input type matches its corresponding Prisma include. A TypeScript project-reference-based validation would be stronger but more complex.
- A CSS class usage scanner (`grep -r '\.<class-name>' src/ --include="*.tsx" --include="*.css"`) could help identify unused styles, but no script was created.

## Assumptions That Were Correct

- All routes use `asyncHandler` consistently — no exceptions found.
- The `ok()` + meta envelope pattern for pagination is used consistently across all list endpoints.
- `AppError` is the only error class used in route handlers.
- CSS files are ordered by specificity in `index.css` import list.

## What Should Be Documented Sooner Next Time

- Add brief `/* Purpose: ... */` comments to each CSS file's first line.
- Add a `scripts/check-include-resource-consistency.sh` script that validates that every field accessed in a resource function's return object exists in the corresponding include's select/include tree.
