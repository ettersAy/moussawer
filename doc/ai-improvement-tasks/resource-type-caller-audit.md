# Problem
`resources.ts` exports type-dependent functions (`userResource`, `bookingResource`, etc.) that are imported by multiple route files. Changing a resource function's parameter type (e.g., `PhotographerProfileShape`) silently breaks all callers that pass a different shape. Build errors surface only at compile time.

# Improvement Needed
Add a script or convention to audit all callers of shared resource functions before modifying their type signatures. This could be a grep-based check or a TypeScript project reference validation.

# Expected Result
Future agents modifying resource serializers will immediately see all affected callers and can update includes/routes in the same edit session without waiting for compilation failures.
