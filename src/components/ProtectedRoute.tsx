import { RequireRole } from "./RequireRole";

/**
 * Route guard that requires the user to be authenticated (any role).
 *
 * This is a thin convenience wrapper around `<RequireRole>` that accepts
 * all roles. If you need role-specific gating, use `<RequireRole>` directly.
 */
export function ProtectedRoute() {
  return <RequireRole allowedRoles={["ADMIN", "CLIENT", "PHOTOGRAPHER"]} />;
}
