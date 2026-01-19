// client/src/pages/PendingRequestsPublic.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getPublicPendingRequestsApi } from "../api/requestApi.js";

import RequestCard from "../components/RequestCard.jsx";
import RequestCardSkeleton from "../components/RequestCardSkeleton.jsx";

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
      const total = !Array.isArray(data) ? data.total ?? items.length : items.length;
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
      navigate("/login", { state: { from: { pathname: target } } });
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blood Donation Requests</h1>
          <p className="text-sm text-slate-600 max-w-xl">
            These are publicly visible pending requests. Log in as a donor to view full details and
            volunteer to donate.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Page <b>{page}</b> of <b>{totalPages}</b>
        </div>
      </div>

      <div className="bg-base-100 shadow-md rounded-xl p-4">
        {message ? (
          <div className="alert alert-info mb-4">
            <span>{message}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No pending donation requests to show.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onViewDetails={(id) => goToDetails(id)}
                onDonate={(id) => goToDetails(id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button className="btn btn-sm" onClick={handlePrev} disabled={page === 1}>
            Previous
          </button>

          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>

          <button className="btn btn-sm" onClick={handleNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
