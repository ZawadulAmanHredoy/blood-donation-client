// client/src/pages/DonationRequestDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  getDonationRequestByIdApi,
  donateToRequestApi,
  changeDonationStatusApi,
} from "../api/requestApi.js";

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

export default function DonationRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRequest = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await getDonationRequestByIdApi(id);
      setRequest(data);
    } catch (err) {
      setMessage(err.message || "Failed to load request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDonate = async () => {
    if (!window.confirm("Confirm you want to donate for this request?")) return;

    setActionLoading(true);
    setMessage("");
    try {
      await donateToRequestApi(id);
      setMessage("You are now assigned as the donor (status: inprogress).");
      await loadRequest();
    } catch (err) {
      setMessage(err.message || "Failed to take this request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this request as "${newStatus}"?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setMessage("");
    try {
      await changeDonationStatusApi(id, newStatus);
      setMessage(`Status updated to ${newStatus}.`);
      await loadRequest();
    } catch (err) {
      setMessage(err.message || "Failed to change status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-base-100 shadow-lg rounded-xl p-6">
        <p className="text-center text-sm text-red-500">
          Donation request not found.
        </p>
        <button className="btn btn-sm mt-4" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  const isOwner =
    request.requester?.user &&
    request.requester.user.toString?.() === user?._id;

  const isDonor =
    request.donor?.user && request.donor.user.toString?.() === user?._id;

  const canMarkDoneOrCanceled =
    request.status === "inprogress" && (isOwner || isDonor);

  const canDonate = request.status === "pending";

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Donation Request Details</h2>
        <span className={statusBadgeClasses(request.status)}>
          {request.status}
        </span>
      </div>

      {message && (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      {/* Recipient & hospital */}
      <div className="space-y-2 mb-4">
        <div>
          <span className="font-semibold">Recipient: </span>
          <span>{request.recipient?.name}</span>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold">Blood Group: </span>
          <span>{request.bloodGroup}</span>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold">Location: </span>
          <span>
            {request.recipient?.district}, {request.recipient?.upazila}
          </span>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold">Hospital: </span>
          <span>{request.hospitalName}</span>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-semibold">Address: </span>
          <span>{request.fullAddress}</span>
        </div>
      </div>

      {/* Date & time */}
      <div className="space-y-1 mb-4 text-sm text-slate-700">
        <div>
          <span className="font-semibold">Donation Date: </span>
          <span>{request.donationDate}</span>
        </div>
        <div>
          <span className="font-semibold">Donation Time: </span>
          <span>{request.donationTime}</span>
        </div>
      </div>

      {/* Request message */}
      <div className="mb-4">
        <h3 className="font-semibold mb-1 text-sm">Request Message</h3>
        <p className="text-sm text-slate-700 whitespace-pre-line">
          {request.requestMessage}
        </p>
      </div>

      {/* Requester info */}
      <div className="mb-4 text-sm text-slate-700">
        <h3 className="font-semibold mb-1">Requested By</h3>
        <p>{request.requester?.name}</p>
        <p className="text-slate-500 text-xs">{request.requester?.email}</p>
      </div>

      {/* Donor info (if already assigned) */}
      {request.donor?.user && (
        <div className="mb-4 text-sm text-slate-700">
          <h3 className="font-semibold mb-1">Assigned Donor</h3>
          <p>{request.donor?.name}</p>
          <p className="text-slate-500 text-xs">{request.donor?.email}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button className="btn btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>

        {canDonate && (
          <button
            className="btn btn-sm btn-primary"
            onClick={handleDonate}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Donate"}
          </button>
        )}

        {canMarkDoneOrCanceled && (
          <>
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleStatusChange("done")}
              disabled={actionLoading}
            >
              Mark as Done
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleStatusChange("canceled")}
              disabled={actionLoading}
            >
              Cancel Request
            </button>
          </>
        )}
      </div>
    </div>
  );
}
