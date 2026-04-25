import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page narrow"><div className="panel">Loading your workspace...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
