// client/src/pages/AdminRequests.jsx
import { useEffect, useState } from "react";
import {
  getAllDonationRequestsApi,
  deleteDonationRequestApi,
  changeDonationStatusApi,
} from "../api/requestApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["all", "pending", "inprogress", "done", "canceled"];

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

export default function AdminRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access denied — Admin only.
      </div>
    );
  }

  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadRequests = async (targetPage = page) => {
    setLoading(true);
    setMessage("");

    try {
      const query = { page: targetPage, limit };
      if (statusFilter !== "all") query.status = statusFilter;

      const data = await getAllDonationRequestsApi(query);
      const items = Array.isArray(data) ? data : data.items || [];
      const tp = !Array.isArray(data) ? data.totalPages || 1 : 1;

      setRequests(items);
      setTotalPages(tp);

      if (items.length === 0) setMessage("No requests found.");
    } catch (err) {
      setMessage(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    loadRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;

    try {
      await deleteDonationRequestApi(id);
      setMessage("Request deleted successfully.");
      loadRequests(page);
    } catch (err) {
      setMessage(err.message || "Failed to delete.");
    }
  };

  const handleStatus = async (id, newStatus) => {
    if (!window.confirm(`Set status to "${newStatus}"?`)) return;

    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage("Status updated.");
      loadRequests(page);
    } catch (err) {
      setMessage(err.message || "Failed to update status.");
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-bold">All Donation Requests (Admin)</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Status:</span>
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <span className="text-sm text-slate-600 ml-2">
            Page <b>{page}</b>/<b>{totalPages}</b>
          </span>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>District</th>
                  <th>Upazila</th>
                  <th>Blood</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.recipientName}</td>
                    <td>{r.recipientDistrict}</td>
                    <td>{r.recipientUpazila}</td>
                    <td>{r.bloodGroup}</td>
                    <td>
                      <span className={statusBadgeClasses(r.status)}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        className="btn btn-xs"
                        onClick={() => navigate(`/dashboard/requests/${r._id}`)}
                      >
                        Details
                      </button>

                      <select
                        className="select select-bordered select-xs"
                        value={r.status}
                        onChange={(e) => handleStatus(r._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrev}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleNext}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
