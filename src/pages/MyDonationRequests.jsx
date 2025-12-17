// client/src/pages/MyDonationRequests.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyDonationRequestsApi,
  deleteDonationRequestApi,
  changeDonationStatusApi,
} from "../api/requestApi.js";

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
      setRequests(data.items || []);
      setTotalPages(data.totalPages || 1);
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
    const confirm = window.confirm("Are you sure you want to delete this donation request?");
    if (!confirm) return;

    try {
      await deleteDonationRequestApi(id);
      setMessage("Donation request deleted successfully.");
      loadRequests();
    } catch (err) {
      setMessage(err.message || "Failed to delete request.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
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

  const handlePrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPage((prev) => Math.min(totalPages, prev + 1));

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
          <span className="text-sm text-slate-600">Filter by status:</span>
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
        </div>
      </div>

      {message && (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">
          No donation requests found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm md:table-md">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient</th>
                <th>Location</th>
                <th>Blood</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req, idx) => (
                <tr key={req._id}>
                  <td>{(page - 1) * limit + idx + 1}</td>

                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium">{req.recipient?.name || "N/A"}</span>
                      <span className="text-xs text-slate-500">{req.hospitalName}</span>
                    </div>
                  </td>

                  <td>
                    <div className="flex flex-col text-xs">
                      <span>{req.recipient?.district}</span>
                      <span className="text-slate-500">{req.recipient?.upazila}</span>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-outline">{req.bloodGroup}</span>
                  </td>

                  <td className="text-xs">
                    <div>{req.donationDate}</div>
                    <div className="text-slate-500">{req.donationTime}</div>
                  </td>

                  <td>
                    <span className={statusBadgeClasses(req.status)}>{req.status}</span>
                  </td>

                  <td>
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        className="btn btn-xs"
                        onClick={() => navigate(`/dashboard/requests/${req._id}`)}
                      >
                        View
                      </button>

                      {/* Edit only when pending (best UX + matches assignment expectation) */}
                      {req.status === "pending" && (
                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() =>
                            navigate(`/dashboard/my-donation-requests/${req._id}/edit`)
                          }
                        >
                          Edit
                        </button>
                      )}

                      {req.status === "inprogress" && (
                        <>
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => handleStatusChange(req._id, "done")}
                          >
                            Done
                          </button>
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => handleStatusChange(req._id, "canceled")}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        className="btn btn-xs btn-error btn-outline"
                        onClick={() => handleDelete(req._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <button className="btn btn-sm" onClick={handlePrevPage} disabled={page <= 1}>
              Previous
            </button>

            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-sm"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
