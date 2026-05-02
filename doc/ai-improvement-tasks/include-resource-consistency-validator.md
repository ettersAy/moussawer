# Problem

The `server/services/resources.ts` file defines `PhotographerProfileShape` as a local type that must manually match the `select` clause in `userInclude.photographerProfile` from `server/routes/includes.ts`. There is no tooling to verify this coupling. If the include's select is changed without updating `PhotographerProfileShape`, the resource function silently returns `undefined` for the affected fields — no TypeScript error surfaces because both types are structurally compatible optional fields.

The same risk applies to all resource functions that rely on shared includes: if a Prisma include is narrowed, the resource function's input type still accepts the old shape, but runtime fields become undefined.

# Improvement Needed

Create a validation script (`scripts/check-include-resource-consistency.sh`) that:
1. Extracts the field list from each shared include's `select`/`include` tree in `includes.ts`.
2. Extracts the accessed field list from each corresponding resource function in `resources.ts`.
3. Reports any field accessed in a resource function that is not included in the corresponding include.
4. Reports any optional/nullable field in an include that is accessed without a `??` fallback in the resource function.

# Expected Result

Future agents modifying includes or resource functions will catch silent-break mismatches before runtime, without needing a full TypeScript compilation pass.
