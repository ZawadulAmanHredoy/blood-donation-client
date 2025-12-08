// client/src/layouts/DashboardLayout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col">
        {/* Brand / user */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-500 text-xl">🩸</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight">
              Lifeline Dashboard
            </span>
            <span className="text-[11px] text-slate-400">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Overview */}
          <MenuSection title="Overview">
            <SidebarLink to="/dashboard" label="Dashboard Home" />
          </MenuSection>

          {/* Requests for all authenticated users */}
          <MenuSection title="Requests">
            <SidebarLink
              to="/dashboard/create-donation-request"
              label="Create Request"
            />
            <SidebarLink
              to="/dashboard/my-donation-requests"
              label="My Donation Requests"
            />
          </MenuSection>

          {/* Volunteer-only section */}
          {user?.role === "volunteer" && (
            <MenuSection title="Volunteer">
              <SidebarLink
                to="/dashboard/volunteer/requests"
                label="My Assigned Requests"
              />
            </MenuSection>
          )}

          {/* Admin-only section */}
          {user?.role === "admin" && (
            <MenuSection title="Admin">
              <SidebarLink
                to="/dashboard/admin/users"
                label="Manage Users"
              />
              <SidebarLink
                to="/dashboard/admin/requests"
                label="Manage Requests"
              />
            </MenuSection>
          )}
        </nav>

        {/* Footer with user info + logout */}
        <div className="p-3 border-t border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-600"
              />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-slate-400">
                {user?.role || "donor"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-xs btn-outline btn-error"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 text-xl">🩸</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Lifeline Dashboard
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-xs btn-outline btn-error"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuSection({ title, children }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function SidebarLink({ to, label }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          [
            "w-full text-left px-3 py-2 rounded-xl flex items-center text-xs font-medium transition",
            isActive
              ? "bg-slate-800 text-white"
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
          ].join(" ")
        }
      >
        {label}
      </NavLink>
    </li>
  );
}
