import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getDashboardSummaryApi } from "../api/statsApi.js";
import { getRequestStatsApi } from "../api/statsApi.js";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DashboardHome() {
  const { user } = useAuth();
  const isPrivileged = user?.role === "admin" || user?.role === "volunteer";

  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isPrivileged) return;

    getDashboardSummaryApi().then(setSummary);
    getRequestStatsApi().then(setStats);
  }, [isPrivileged]);

  if (!isPrivileged) {
    return <p className="text-slate-400">Welcome to your dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Total Users" value={summary?.totalUsers} />
        <Stat label="Total Funds" value={summary?.totalFunds} />
        <Stat label="Pending Requests" value={summary?.requests?.pending} />
      </div>

      {/* CHARTS (MANDATORY) */}
      {stats && (
        <>
          <ChartBox title="Daily Donation Requests">
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#ef4444" />
            </LineChart>
          </ChartBox>

          <ChartBox title="Monthly Donation Requests">
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22c55e" />
            </LineChart>
          </ChartBox>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-bold text-white">{value ?? 0}</p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
