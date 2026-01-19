// client/src/pages/MyDonationRequests.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDonationRequestsApi,
  deleteDonationRequestApi,
  changeDonationStatusApi,
} from "../api/requestApi.js";

const STATUS_OPTIONS = ["all", "pending", "inprogress", "done", "canceled"];

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

export default function MyDonationRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const query = { page, limit };
      if (statusFilter !== "all") query.status = statusFilter;

      const data = await getMyDonationRequestsApi(query);

      setRequests(data?.items || []);
      setTotalPages(data?.totalPages || 1);

      if ((data?.items || []).length === 0) {
        setMessage("No donation requests found.");
      }
    } catch (err) {
      setMessage(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this donation request?");
    if (!ok) return;

    try {
      await deleteDonationRequestApi(id);
      setMessage("Donation request deleted successfully.");
      loadRequests();
    } catch (err) {
      setMessage(err.message || "Failed to delete request.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const ok = window.confirm(`Are you sure you want to set status to "${newStatus}"?`);
    if (!ok) return;

    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage(`Status updated to ${newStatus}.`);
      loadRequests();
    } catch (err) {
      setMessage(err.message || "Failed to update status.");
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">My Donation Requests</h2>
          <p className="text-sm text-slate-500">
            View, manage, and update your blood donation requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Filter by status</span>
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-1">
            Page <b>{page}</b> / <b>{totalPages}</b>
          </span>
        </div>
      </div>

      {message ? (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">No donation requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm md:table-md table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient</th>
                <th>Location</th>
                <th>Blood</th>
                <th>Date &amp; time</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req, idx) => {
                const id = normalizeId(req);

                const location = [req?.recipient?.district, req?.recipient?.upazila]
                  .filter(Boolean)
                  .join(", ");

                const dateTime = formatDateTimeShort(req?.donationDate, req?.donationTime);
                const due = getDueInfo(req?.donationDate);

                return (
                  <tr key={id || idx}>
                    <td>{(page - 1) * limit + idx + 1}</td>

                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{req?.recipient?.name || "N/A"}</span>
                        <span className="text-xs text-slate-500">{req?.hospitalName || "N/A"}</span>
                      </div>
                    </td>

                    <td className="text-xs">{location || "N/A"}</td>

                    <td>
                      <span className="badge badge-outline">{req?.bloodGroup || "N/A"}</span>
                    </td>

                    <td className="text-xs">
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-slate-700"
                          title={`${req?.donationDate || ""} ${req?.donationTime || ""}`.trim()}
                        >
                          {dateTime}
                        </span>
                        <span className={due.badgeClass}>{due.label}</span>
                      </div>
                    </td>

                    <td>
                      <span className={statusBadgeClasses(req?.status)}>{req?.status}</span>
                    </td>

                    <td>
                      <div className="flex flex-wrap justify-end gap-1">
                        <button
                          className="btn btn-xs"
                          onClick={() => navigate(`/dashboard/requests/${id}`)}
                          disabled={!id}
                        >
                          View
                        </button>

                        {req?.status === "pending" ? (
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => navigate(`/dashboard/my-donation-requests/${id}/edit`)}
                            disabled={!id}
                          >
                            Edit
                          </button>
                        ) : null}

                        {req?.status === "inprogress" ? (
                          <>
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleStatusChange(id, "done")}
                              disabled={!id}
                            >
                              Done
                            </button>
                            <button
                              className="btn btn-xs btn-warning"
                              onClick={() => handleStatusChange(id, "canceled")}
                              disabled={!id}
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}

                        <button
                          className="btn btn-xs btn-error btn-outline"
                          onClick={() => handleDelete(id)}
                          disabled={!id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button className="btn btn-sm" onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>

        <span className="text-xs text-slate-500">
          Page {page} of {totalPages}
        </span>

        <button className="btn btn-sm" onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
