// client/src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium ${
      isActive ? "text-red-400" : "text-slate-200 hover:text-white"
    }`;

  return (
    <header className="bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-500 text-xl">🩸</span>
          </div>
          <span className="font-semibold text-base tracking-tight">
            Lifeline
          </span>
        </Link>

        {/* Center nav links */}
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Right side auth buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-xs text-slate-300">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-xs md:btn-sm btn-outline btn-error"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-xs md:btn-sm btn-ghost">
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-xs md:btn-sm btn-primary"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
