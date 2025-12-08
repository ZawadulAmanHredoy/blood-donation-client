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
  const navigate = useNavigate();
  const { user } = useAuth();

  // Frontend guard: only volunteers can see this page
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

  const loadRequests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await getVolunteerRequestsApi({});
      setRequests(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setMessage(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark as "${newStatus}"?`)) {
      return;
    }
    setActionLoadingId(id);
    setMessage("");

    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage("Status updated.");
      await loadRequests();
    } catch (err) {
      setMessage(err.message || "Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">My Assigned Requests</h2>
          <p className="text-xs text-slate-500">
            These requests are assigned to you as a volunteer/donor.
          </p>
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
        <p className="text-center text-sm text-slate-500 py-4">
          No assigned requests found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm md:table-md">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient</th>
                <th>Blood</th>
                <th>Location</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
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
                    <div>{req.recipient?.district}</div>
                    <div className="text-slate-500">
                      {req.recipient?.upazila}
                    </div>
                  </td>
                  <td className="text-xs">
                    <div>{req.donationDate}</div>
                    <div className="text-slate-500">{req.donationTime}</div>
                  </td>
                  <td>
                    <span className={statusBadgeClasses(req.status)}>
                      {req.status}
                    </span>
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
                            disabled={actionLoadingId === req._id}
                            onClick={() =>
                              handleStatusChange(req._id, "done")
                            }
                          >
                            {actionLoadingId === req._id
                              ? "Saving..."
                              : "Done"}
                          </button>
                          <button
                            className="btn btn-xs btn-warning"
                            disabled={actionLoadingId === req._id}
                            onClick={() =>
                              handleStatusChange(req._id, "canceled")
                            }
                          >
                            {actionLoadingId === req._id
                              ? "Saving..."
                              : "Cancel"}
                          </button>
                        </>
                      )}
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
