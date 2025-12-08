// client/src/pages/DashboardHome.jsx
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            Here is an overview of your recent blood donation activity.
          </p>
        </div>
        <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
          Role: <span className="ml-1 font-semibold capitalize">{user?.role}</span>
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <DashboardStatCard
          label="My Requests"
          value="12"
          subtitle="Total created (mock data)"
        />
        <DashboardStatCard
          label="Completed"
          value="4"
          subtitle="Successful donations"
        />
        <DashboardStatCard
          label="Pending"
          value="3"
          subtitle="Awaiting donors"
        />
      </div>

      {/* Recent requests table mock */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-sm">Recent donation requests</h2>
            <p className="text-xs text-slate-500">
              Showing your 3 most recent requests (mock).
            </p>
          </div>
          <button className="text-xs font-semibold text-red-500 hover:underline">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <Th>Recipient</Th>
                <Th>Location</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Blood</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              <RequestRow
                name="Rahim"
                location="Dhanmondi, Dhaka"
                date="12 Dec 2025"
                time="3:30 PM"
                group="A+"
                status="pending"
              />
              <RequestRow
                name="Karim"
                location="Panthapath, Dhaka"
                date="14 Dec 2025"
                time="5:00 PM"
                group="O-"
                status="inprogress"
              />
              <RequestRow
                name="Sara"
                location="Chattogram"
                date="15 Dec 2025"
                time="10:00 AM"
                group="B+"
                status="done"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({ label, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-1">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={
        "px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide " +
        className
      }
    >
      {children}
    </th>
  );
}

function RequestRow({ name, location, date, time, group, status }) {
  const statusColor =
    {
      pending: "bg-amber-100 text-amber-700",
      inprogress: "bg-sky-100 text-sky-700",
      done: "bg-emerald-100 text-emerald-700",
      canceled: "bg-red-100 text-red-700",
    }[status] || "bg-slate-100 text-slate-700";

  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-4 py-2 text-sm">{name}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{location}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{date}</td>
      <td className="px-4 py-2 text-sm text-slate-600">{time}</td>
      <td className="px-4 py-2 text-sm font-semibold">{group}</td>
      <td className="px-4 py-2 text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-2 text-sm text-right">
        <button className="text-xs font-semibold text-red-500 hover:underline mr-2">
          View
        </button>
        <button className="text-xs font-semibold text-slate-500 hover:underline">
          Details
        </button>
      </td>
    </tr>
  );
}
