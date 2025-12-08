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

  // Access control
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

  const loadRequests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const query = {};
      if (statusFilter !== "all") query.status = statusFilter;

      const data = await getAllDonationRequestsApi(query);
      setRequests(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setMessage(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request permanently?")) return;

    try {
      await deleteDonationRequestApi(id);
      setMessage("Request deleted successfully.");
      loadRequests();
    } catch (err) {
      setMessage(err.message || "Failed to delete.");
    }
  };

  const handleStatus = async (id, newStatus) => {
    if (!window.confirm(`Set status to "${newStatus}"?`)) return;

    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage("Status updated.");
      loadRequests();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-base-100 p-6 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">Manage Donation Requests</h2>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Filter:</span>
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All" : s}
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
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-md">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient</th>
                <th>Blood</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Donor</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req, idx) => (
                <tr key={req._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {req.recipient?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {req.hospitalName}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-outline">
                      {req.bloodGroup}
                    </span>
                  </td>

                  <td className="text-xs">
                    {req.recipient?.district},{" "}
                    <span className="text-slate-500">
                      {req.recipient?.upazila}
                    </span>
                  </td>

                  <td className="text-xs">
                    {req.donationDate}
                    <br />
                    <span className="text-slate-500">{req.donationTime}</span>
                  </td>

                  <td>
                    <span className={statusBadgeClasses(req.status)}>
                      {req.status}
                    </span>
                  </td>

                  <td className="text-xs">
                    {req.donor?.name || (
                      <span className="text-slate-400">— none —</span>
                    )}
                  </td>

                  <td>
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        className="btn btn-xs"
                        onClick={() =>
                          navigate(`/dashboard/requests/${req._id}`)
                        }
                      >
                        View
                      </button>

                      {req.status === "inprogress" && (
                        <>
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => handleStatus(req._id, "done")}
                          >
                            Done
                          </button>

                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => handleStatus(req._id, "canceled")}
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
        </div>
      )}
    </div>
  );
}
