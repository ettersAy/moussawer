import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page narrow"><div className="panel">Loading admin workspace...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
