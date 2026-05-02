# Problem
The relationship between `includes.ts` (Prisma include definitions), `resources.ts` (serializer functions), and route handlers is implicit. Modifying one often requires coordinated changes in the others, but there is no documentation or index of which resource depends on which include.

# Improvement Needed
Document the dependency chain: route → include → resource serializer. Add inline comments or a README explaining that expanding a resource serializer field requires updating both the corresponding include object and all callers.

# Expected Result
Agents will understand the three-layer architecture and make coordinated changes in a single pass instead of discovering broken imports one by one.
