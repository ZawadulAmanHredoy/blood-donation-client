// client/src/pages/DonationRequestDetails.jsx

import { useEffect, useMemo, useState } from "react";
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
    year: "numeric",
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
    if (!window.confirm(`Are you sure you want to mark this request as "${newStatus}"?`)) return;

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
        <p className="text-center text-sm text-red-500">Donation request not found.</p>
        <div className="text-center mt-4">
          <button className="btn btn-sm" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const isOwner =
    request?.requester?.user &&
    (request.requester.user.toString?.() === user?.id || String(request.requester.user) === user?.id);

  const isDonor =
    request?.donor?.user &&
    (request.donor.user.toString?.() === user?.id || String(request.donor.user) === user?.id);

  const canDonate = request?.status === "pending";
  const canMarkDoneOrCanceled = request?.status === "inprogress" && (isOwner || isDonor);

  const due = useMemo(() => getDueInfo(request?.donationDate), [request?.donationDate]);
  const dateTimeLabel = useMemo(
    () => formatDateTimeShort(request?.donationDate, request?.donationTime),
    [request?.donationDate, request?.donationTime]
  );

  const location = useMemo(() => {
    const district = request?.recipient?.district;
    const upazila = request?.recipient?.upazila;
    return [upazila, district].filter(Boolean).join(", ");
  }, [request]);

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold">Donation Request Details</h2>
        <span className={statusBadgeClasses(request.status)}>{request.status}</span>
      </div>

      {message ? (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      ) : null}

      <div className="space-y-3 text-sm text-slate-700">
        <div>
          <span className="font-semibold">Recipient:</span>{" "}
          <span>{request?.recipient?.name || "N/A"}</span>
        </div>

        <div>
          <span className="font-semibold">Blood group:</span>{" "}
          <span>{request?.bloodGroup || "N/A"}</span>
        </div>

        <div>
          <span className="font-semibold">Location:</span> <span>{location || "N/A"}</span>
        </div>

        <div>
          <span className="font-semibold">Hospital:</span>{" "}
          <span>{request?.hospitalName || "N/A"}</span>
        </div>

        <div>
          <span className="font-semibold">Address:</span>{" "}
          <span>{request?.fullAddress || "N/A"}</span>
        </div>

        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Donation time:</span>
            <span
              className="text-slate-800"
              title={`${request?.donationDate || ""} ${request?.donationTime || ""}`.trim()}
            >
              {dateTimeLabel}
            </span>
            <span className={due.badgeClass}>{due.label}</span>
          </div>
        </div>
      </div>

      {request?.requestMessage ? (
        <div className="mt-5">
          <h3 className="font-semibold mb-1 text-sm">Request message</h3>
          <p className="text-sm text-slate-700 whitespace-pre-line">{request.requestMessage}</p>
        </div>
      ) : null}

      <div className="mt-5 text-sm text-slate-700">
        <h3 className="font-semibold mb-1 text-sm">Requested by</h3>
        <p>{request?.requester?.name || "N/A"}</p>
        <p className="text-slate-500 text-xs">{request?.requester?.email || ""}</p>
      </div>

      {request?.donor?.user ? (
        <div className="mt-4 text-sm text-slate-700">
          <h3 className="font-semibold mb-1 text-sm">Assigned donor</h3>
          <p>{request?.donor?.name || "N/A"}</p>
          <p className="text-slate-500 text-xs">{request?.donor?.email || ""}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 mt-6">
        <button className="btn btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>

        {canDonate ? (
          <button
            className="btn btn-sm btn-primary"
            onClick={handleDonate}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Donate"}
          </button>
        ) : null}

        {canMarkDoneOrCanceled ? (
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
        ) : null}
      </div>
    </div>
  );
}
