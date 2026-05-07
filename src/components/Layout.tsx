import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Camera, LayoutDashboard, LogOut, MessageCircle, Search, ShieldCheck, Shield } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Moussawer home">
          <span className="brand-mark">
            <Camera size={18} />
          </span>
          <span>Moussawer</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/photographers">
            <Search size={16} />
            Discover
          </NavLink>
          <NavLink to="/support">Support</NavLink>
          {user && (
            <>
              <NavLink to="/dashboard">
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/messages">
                <MessageCircle size={16} />
                Messages
              </NavLink>
              <NavLink to="/cases">
                <ShieldCheck size={16} />
                Cases
              </NavLink>
              {user.role === "PHOTOGRAPHER" && (
                <NavLink to="/photographer">
                  <Camera size={16} />
                  Workspace
                </NavLink>
              )}
              {user.role === "ADMIN" && (
                <NavLink to="/admin">
                  <Shield size={16} />
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link className="icon-button" to="/dashboard" title="Notifications">
                <Bell size={17} />
              </Link>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="ghost-button" to="/login">
                Log in
              </Link>
              <Link className="solid-button" to="/register">
                Join
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
