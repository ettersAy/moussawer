import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, Camera, LayoutDashboard, LogOut, Menu, MessageCircle, Search, ShieldCheck, Shield, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeNav();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNav();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileNavOpen, closeNav]);

  const navLinks = (
    <nav className="site-nav" aria-label="Primary navigation">
      <NavLink to="/photographers" onClick={closeNav}>
        <Search size={16} />
        Discover
      </NavLink>
      <NavLink to="/support" onClick={closeNav}>Support</NavLink>
      {user && (
        <>
          <NavLink to="/dashboard" onClick={closeNav}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/messages" onClick={closeNav}>
            <MessageCircle size={16} />
            Messages
          </NavLink>
          <NavLink to="/cases" onClick={closeNav}>
            <ShieldCheck size={16} />
            Cases
          </NavLink>
          {user.role === "PHOTOGRAPHER" && (
            <NavLink to="/photographer" onClick={closeNav}>
              <Camera size={16} />
              Workspace
            </NavLink>
          )}
          {user.role === "ADMIN" && (
            <NavLink to="/admin" onClick={closeNav}>
              <Shield size={16} />
              Admin
            </NavLink>
          )}
        </>
      )}
    </nav>
  );

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="Moussawer home">
          <span className="brand-mark">
            <Camera size={18} />
          </span>
          <span>Moussawer</span>
        </Link>

        {/* Desktop nav (visible on wider screens) */}
        <div className="site-nav-desktop">
          {navLinks}
        </div>

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
                <span className="hide-on-mobile">Sign out</span>
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

          <button
            className="hamburger"
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile nav overlay + drawer */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-drawer" ref={drawerRef} id="mobile-nav">
            <div className="mobile-nav-header">
              <span className="brand">
                <span className="brand-mark">
                  <Camera size={18} />
                </span>
                Moussawer
              </span>
              <button className="icon-button" type="button" onClick={closeNav} aria-label="Close navigation">
                <X size={20} />
              </button>
            </div>
            {navLinks}
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
