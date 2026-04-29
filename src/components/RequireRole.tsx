import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "ADMIN" | "CLIENT" | "PHOTOGRAPHER";

type RequireRoleProps = {
  /** Only users with one of these roles are allowed through. */
  allowedRoles: Role[];
  /** Where to send unauthenticated users. Defaults to `/login`. */
  redirectTo?: string;
  /** Where to send authenticated users who lack the required role. Defaults to `/dashboard`. */
  redirectUnauthorized?: string;
  /** Loading message shown while auth state is being resolved. */
  loadingMessage?: string;
};

/**
 * Generalized route guard that checks authentication and role membership.
 *
 * @example
 * // Only ADMIN can access
 * <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
 *   <Route path="/admin" element={<AdminPage />} />
 * </Route>
 *
 * @example
 * // ADMIN or MODERATOR (after adding MODERATOR role)
 * <Route element={<RequireRole allowedRoles={["ADMIN", "MODERATOR"]} />}>
 *   <Route path="/moderator" element={<ModeratorPage />} />
 * </Route>
 */
export function RequireRole({
  allowedRoles,
  redirectTo = "/login",
  redirectUnauthorized = "/dashboard",
  loadingMessage = "Loading your workspace...",
}: RequireRoleProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page narrow">
        <div className="panel">{loadingMessage}</div>
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={redirectUnauthorized} replace />;

  return <Outlet />;
}
