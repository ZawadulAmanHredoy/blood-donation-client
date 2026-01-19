// client/src/pages/PublicRequestDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function PublicRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRequest = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/public/requests/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load request.");
      }
      const data = await res.json();
      setRequest(data);
    } catch (err) {
      setRequest(null);
      setMessage(err.message || "Failed to load request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenInDashboard = () => {
    const target = `/dashboard/requests/${id}`;
    if (isAuthenticated) {
      navigate(target);
    } else {
      navigate("/login", {
        state: { from: { pathname: target } },
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-base-100 shadow-lg rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Donation request not found</h1>
          <p className="text-sm text-slate-500">
            {message || "This request may have been removed or is no longer public."}
          </p>
        </div>
      </div>
    );
  }

  const {
    recipient,
    hospitalName,
    fullAddress,
    bloodGroup,
    donationDate,
    donationTime,
    status,
    requestMessage,
  } = request;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb / header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Public Donation Request
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {recipient?.name || "Blood Donation Request"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            View request details. Log in as a donor to volunteer and track status in your dashboard.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <span className={`inline-flex items-center gap-2 ${statusBadgeClasses(status)}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-70" />
            <span className="capitalize">{status}</span>
          </span>
          <button
            type="button"
            onClick={handleOpenInDashboard}
            className="btn btn-sm btn-primary mt-1"
          >
            {isAuthenticated ? "Open in Dashboard" : "Login to Donate"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: overview / story */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-base-100 shadow-lg rounded-2xl p-5 space-y-2">
            <h2 className="text-lg font-bold">Overview</h2>
            <p className="text-sm text-slate-600">
              {requestMessage || "No additional message was provided for this request."}
            </p>
          </div>

          <div className="bg-base-100 shadow-lg rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-bold">Recipient & Hospital</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase">Recipient</p>
                <p className="font-medium">
                  {recipient?.name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Hospital</p>
                <p className="font-medium">{hospitalName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Location</p>
                <p className="font-medium">
                  {recipient?.upazila && recipient?.district
                    ? `${recipient.upazila}, ${recipient.district}`
                    : recipient?.district || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase">Full address</p>
                <p className="font-medium break-words">{fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: key information */}
        <div className="space-y-4">
          <div className="bg-base-100 shadow-lg rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-bold">Key Information</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Blood group</dt>
                <dd className="font-semibold">
                  <span className="badge badge-outline">{bloodGroup}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Donation date</dt>
                <dd className="font-medium">{donationDate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Donation time</dt>
                <dd className="font-medium">{donationTime}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Current status</dt>
                <dd className="font-medium capitalize">{status}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-base-100 shadow-lg rounded-2xl p-5 space-y-3">
            <h2 className="text-lg font-bold">How to Donate</h2>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
              <li>Log in or register as a donor.</li>
              <li>Open this request in your dashboard.</li>
              <li>Accept the request to share your details with the requester.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
