// client/src/components/RequestCard.jsx
import React, { useMemo } from "react";

function normalizeId(req) {
  return req?._id || req?.id;
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

  const pretty = target.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return { label: `On ${pretty}`, badgeClass: "badge badge-ghost" };
}

export default function RequestCard({ request, onViewDetails, onDonate }) {
  const id = normalizeId(request);

  const recipientName = request?.recipient?.name || "N/A";
  const district = request?.recipient?.district || "";
  const upazila = request?.recipient?.upazila || "";
  const location = [upazila, district].filter(Boolean).join(", ");

  const hospitalName = request?.hospitalName || "N/A";
  const bloodGroup = request?.bloodGroup || "N/A";
  const donationDate = request?.donationDate || "";
  const donationTime = request?.donationTime || "";

  const due = useMemo(() => getDueInfo(donationDate), [donationDate]);
  const dateTimeLabel = useMemo(
    () => formatDateTimeShort(donationDate, donationTime),
    [donationDate, donationTime]
  );

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-base truncate">{recipientName}</h3>
            <p className="text-xs text-slate-500 truncate">{hospitalName}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="badge badge-outline">{bloodGroup}</span>
            <span className={due.badgeClass}>{due.label}</span>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs text-slate-600">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Location</span>
            <span className="text-right truncate">{location || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">Date & time</span>
            <span className="text-right truncate" title={`${donationDate} ${donationTime}`.trim()}>
              {dateTimeLabel}
            </span>
          </div>
        </div>

        <div className="card-actions justify-end mt-4 gap-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={!id}
            onClick={() => onViewDetails?.(id)}
          >
            Details
          </button>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={!id}
            onClick={() => onDonate?.(id)}
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
}
