// client/src/pages/PendingRequestsPublic.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getPublicPendingRequestsApi } from "../api/requestApi.js";

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

export default function PendingRequestsPublic() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await getPublicPendingRequestsApi({ page, limit });

      const items = Array.isArray(data) ? data : data.items || [];
      const total = !Array.isArray(data)
        ? data.total ?? items.length
        : items.length;
      const lim = !Array.isArray(data) ? data.limit ?? limit : limit;
      const pages = Math.max(1, Math.ceil(total / lim));

      setRequests(items);
      setTotalPages(pages);

      if (items.length === 0) {
        setMessage("No pending donation requests at the moment.");
      }
    } catch (err) {
      setMessage(err.message || "Failed to load pending requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const goToDetails = (id) => {
    const target = `/dashboard/requests/${id}`;
    if (isAuthenticated) {
      navigate(target);
    } else {
      navigate("/login", {
        state: { from: { pathname: target } },
      });
    }
  };

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blood Donation Requests</h1>
          <p className="text-sm text-slate-600 max-w-xl">
            These are publicly visible pending requests. Log in as a donor to
            view full details and volunteer to donate.
          </p>
        </div>
      </div>

      <div className="bg-base-100 shadow-md rounded-xl p-4">
        {message && (
          <div className="alert alert-info mb-3">
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No pending donation requests to show.
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
                  <th>Hospital</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => (
                  <tr key={req._id || idx}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td>{req.recipient?.name || "N/A"}</td>
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
                    <td className="text-xs">{req.hospitalName}</td>
                    <td className="text-xs">
                      <div>{req.donationDate}</div>
                      <div className="text-slate-500">
                        {req.donationTime}
                      </div>
                    </td>
                    <td>
                      <span className={statusBadgeClasses(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => goToDetails(req._id)}
                        >
                          View &amp; Donate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button
                className="btn btn-sm"
                onClick={handlePrev}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-sm"
                onClick={handleNext}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
