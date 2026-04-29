# Problem
`ProtectedRoute` and `AdminRoute` are nearly identical components duplicating loading/redirect logic. A third role (e.g. `MODERATOR`) would create more duplication.

# Improvement Needed
Generalize the route guard into a single `RequireRole` component that accepts allowed roles as a prop. `ProtectedRoute` and `AdminRoute` should become thin wrappers or be removed entirely.

# Expected Result
Adding a new role-gated route (e.g. moderator panel) requires zero new components — just pass `allowedRoles={["ADMIN", "MODERATOR"]}` to `RequireRole`.
