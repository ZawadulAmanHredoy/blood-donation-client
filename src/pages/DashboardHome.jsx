import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getDashboardSummaryApi, getRequestStatsApi } from "../api/statsApi.js";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-lg">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-white">{value ?? 0}</p>
      {helper ? <p className="mt-1 text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

function ChartCard({ title, subtitle, children, rightSlot }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-950 to-slate-900 p-5 shadow-lg">
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle ? (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="mt-2 md:mt-0">{rightSlot}</div> : null}
      </div>

      <div className="h-[320px] w-full">{children}</div>
    </div>
  );
}

function PrettyTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-bold text-white">{value} requests</p>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const isPrivileged = user?.role === "admin" || user?.role === "volunteer";

  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const role = user?.role || "donor";

  useEffect(() => {
    if (!isPrivileged) return;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [s, chart] = await Promise.all([
          getDashboardSummaryApi(),
          getRequestStatsApi(),
        ]);
        setSummary(s);
        setStats(chart);
      } catch (e) {
        setError(e.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isPrivileged]);

  const lastUpdatedText = useMemo(() => {
    const now = new Date();
    return now.toLocaleString();
  }, []);

  if (!isPrivileged) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900 p-6 text-slate-200">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Welcome! Charts are available for Admin/Volunteer only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {role === "admin" ? "Admin Dashboard" : "Volunteer Dashboard"}
          </h1>
          <p className="text-sm text-slate-400">
            Daily, weekly, and monthly request statistics.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          {loading ? "Loading…" : `Last updated: ${lastUpdatedText}`}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Users"
          value={loading ? "…" : summary?.totalUsers}
          helper="All registered users"
        />
        <StatCard
          label="Total Funds (BDT)"
          value={loading ? "…" : summary?.totalFunds}
          helper="Sum of all funding"
        />
        <StatCard
          label="Pending Requests"
          value={loading ? "…" : summary?.requests?.pending}
          helper="Needs donors"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="In Progress Requests"
          value={loading ? "…" : summary?.requests?.inprogress}
          helper="Accepted / ongoing"
        />
        <StatCard
          label="Completed Requests"
          value={loading ? "…" : summary?.requests?.done}
          helper="Done donations"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily Requests"
          subtitle="Last 30 days (createdAt)"
          rightSlot={
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Line chart
            </span>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.daily || []} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <Tooltip content={<PrettyTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weekly Requests"
          subtitle="Last 12 weeks (ISO week)"
          rightSlot={
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Trend view
            </span>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.weekly || []} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <Tooltip content={<PrettyTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly Requests"
          subtitle="Last 12 months"
          rightSlot={
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Overview
            </span>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.monthly || []} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={{ stroke: "#334155" }}
              />
              <Tooltip content={<PrettyTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-950 p-5 shadow-lg">
          <h2 className="text-lg font-bold text-white">Notes</h2>
          <p className="mt-2 text-sm text-slate-400">
            These charts use <b className="text-slate-200">DonationRequest.createdAt</b> and count
            how many requests were created in each time bucket.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-400 space-y-1">
            <li>Daily: last 30 days</li>
            <li>Weekly: last 12 weeks</li>
            <li>Monthly: last 12 months</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
