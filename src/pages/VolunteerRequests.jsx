// client/src/pages/VolunteerRequests.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVolunteerRequestsApi,
  changeDonationStatusApi,
} from "../api/requestApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

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

export default function VolunteerRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== "volunteer") {
    return (
      <div className="bg-base-100 rounded-xl p-6 shadow text-center text-red-500 font-semibold">
        Access denied — Volunteer only.
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
                        disabled={actionLoadingId === r._id}
                        onChange={(e) => handleStatus(r._id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="inprogress">inprogress</option>
                        <option value="done">done</option>
                        <option value="canceled">canceled</option>
                      </select>
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
