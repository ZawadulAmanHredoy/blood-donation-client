// client/src/pages/VolunteerRequests.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVolunteerRequestsApi, changeDonationStatusApi } from "../api/requestApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function normalizeId(req) {
  return req?._id || req?.id;
}

function statusBadgeClasses(status) {
  switch (status) {
    case "pending":
      return "badge badge-warning";
    case "inprogress":
      return "badge badge-info";
    case "done":
      return "badge badge-success";
    case "canceled":
      return "badge badge-error";
    default:
      return "badge";
  }
}

function formatTime12(timeHHMM) {
  if (!timeHHMM || typeof timeHHMM !== "string") return "";
  const parts = timeHHMM.split(":");
  if (parts.length < 2) return timeHHMM;

  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return timeHHMM;

  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(m).padStart(2, "0");
  return `${hour12}:${mm} ${suffix}`;
}

function formatDateShort(dateYYYYMMDD) {
  if (!dateYYYYMMDD || typeof dateYYYYMMDD !== "string") return "";
  const d = new Date(`${dateYYYYMMDD}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateYYYYMMDD;

  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTimeShort(dateYYYYMMDD, timeHHMM) {
  const datePart = formatDateShort(dateYYYYMMDD);
  const timePart = formatTime12(timeHHMM);

  if (datePart && timePart) return `${datePart} • ${timePart}`;
  if (datePart) return datePart;
  if (timePart) return timePart;
  return "N/A";
}

function getDueInfo(donationDate) {
  if (!donationDate || typeof donationDate !== "string") {
    return { label: "Date not set", badgeClass: "badge badge-ghost" };
  }

  const target = new Date(`${donationDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) {
    return { label: "Invalid date", badgeClass: "badge badge-ghost" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((target.getTime() - today.getTime()) / msPerDay);

  if (diffDays < 0) {
    const d = Math.abs(diffDays);
    return {
      label: d === 1 ? "Overdue by 1 day" : `Overdue by ${d} days`,
      badgeClass: "badge badge-error",
    };
  }
  if (diffDays === 0) return { label: "Today", badgeClass: "badge badge-warning" };
  if (diffDays === 1) return { label: "Tomorrow", badgeClass: "badge badge-warning" };
  if (diffDays <= 3) return { label: `In ${diffDays} days`, badgeClass: "badge badge-info" };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, badgeClass: "badge badge-outline" };

  return { label: "Upcoming", badgeClass: "badge badge-ghost" };
}

export default function VolunteerRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== "volunteer") {
    return (
      <div className="bg-base-100 rounded-xl p-6 shadow text-center text-red-500 font-semibold">
        Access denied (Volunteer only).
      </div>
    );
  }

  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadRequests = async (targetPage = page) => {
    setLoading(true);
    setMessage("");

    try {
      const data = await getVolunteerRequestsApi({ page: targetPage, limit });
      const items = Array.isArray(data) ? data : data.items || [];
      const tp = !Array.isArray(data) ? data.totalPages || 1 : 1;

      setRequests(items);
      setTotalPages(tp);

      if (items.length === 0) setMessage("No requests assigned to you yet.");
    } catch (err) {
      setMessage(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    setMessage("");

    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage("Status updated.");
      await loadRequests(page);
    } catch (err) {
      setMessage(err.message || "Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Volunteer Requests</h2>
        <div className="text-sm text-slate-600">
          Page <b>{page}</b> / <b>{totalPages}</b>
        </div>
      </div>

      {message ? (
        <div className="alert alert-info">
          <span>{message}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>District</th>
                <th>Upazila</th>
                <th>Blood</th>
                <th>Date &amp; time</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => {
                const id = normalizeId(r);

                const dateTime = formatDateTimeShort(r?.donationDate, r?.donationTime);
                const due = getDueInfo(r?.donationDate);

                return (
                  <tr key={id}>
                    <td>{r?.recipient?.name || r?.recipientName || "N/A"}</td>
                    <td>{r?.recipient?.district || r?.recipientDistrict || "N/A"}</td>
                    <td>{r?.recipient?.upazila || r?.recipientUpazila || "N/A"}</td>

                    <td>
                      <span className="badge badge-outline">{r?.bloodGroup || "N/A"}</span>
                    </td>

                    <td className="text-xs">
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-slate-700"
                          title={`${r?.donationDate || ""} ${r?.donationTime || ""}`.trim()}
                        >
                          {dateTime}
                        </span>
                        <span className={due.badgeClass}>{due.label}</span>
                      </div>
                    </td>

                    <td>
                      <span className={statusBadgeClasses(r?.status)}>{r?.status}</span>
                    </td>

                    <td className="text-right space-x-2">
                      <button
                        className="btn btn-xs"
                        onClick={() => navigate(`/dashboard/requests/${id}`)}
                        disabled={!id}
                      >
                        Details
                      </button>

                      <select
                        className="select select-bordered select-xs"
                        value={r?.status || "pending"}
                        disabled={!id || actionLoadingId === id}
                        onChange={(e) => handleStatus(id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="inprogress">inprogress</option>
                        <option value="done">done</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        <button className="btn btn-outline btn-sm" onClick={handlePrev} disabled={page === 1}>
          Prev
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
