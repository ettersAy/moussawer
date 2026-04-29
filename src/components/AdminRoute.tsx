import { RequireRole } from "./RequireRole";

/**
 * Route guard that requires the user to be authenticated with role ADMIN.
 *
 * This is a thin convenience wrapper around `<RequireRole>`. If you need
 * role-specific gating (e.g. ADMIN + MODERATOR), use `<RequireRole>` directly.
 */
export function AdminRoute() {
  return <RequireRole allowedRoles={["ADMIN"]} loadingMessage="Loading admin workspace..." />;
}
