import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getDashboardSummaryApi } from "../api/statsApi.js";

function DashboardStatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-5 shadow-md">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-extrabold text-white">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const role = user?.role;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminOrVolunteer = useMemo(
    () => role === "admin" || role === "volunteer",
    [role]
  );

  useEffect(() => {
    if (!isAdminOrVolunteer) return;

    const loadStats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getDashboardSummaryApi();
        setSummary(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAdminOrVolunteer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-sm text-slate-400">
          Dashboard overview of the blood donation system
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Admin / Volunteer Stats */}
      {isAdminOrVolunteer && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <DashboardStatCard
              label="Total Users"
              value={loading ? "…" : summary?.totalUsers ?? 0}
              subtitle="Registered users"
            />

            <DashboardStatCard
              label="Total Funds (BDT)"
              value={loading ? "…" : summary?.totalFunds ?? 0}
              subtitle="All contributions"
            />

            <DashboardStatCard
              label="Pending Requests"
              value={loading ? "…" : summary?.requests?.pending ?? 0}
              subtitle="Awaiting donors"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DashboardStatCard
              label="In Progress Requests"
              value={loading ? "…" : summary?.requests?.inprogress ?? 0}
              subtitle="Currently active"
            />

            <DashboardStatCard
              label="Completed Requests"
              value={loading ? "…" : summary?.requests?.done ?? 0}
              subtitle="Successfully completed"
            />
          </div>
        </>
      )}

      {/* Donor fallback */}
      {!isAdminOrVolunteer && (
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard label="My Requests" value="—" />
          <DashboardStatCard label="Completed" value="—" />
          <DashboardStatCard label="Pending" value="—" />
        </div>
      )}
    </div>
  );
}
