// client/src/components/RequestCardSkeleton.jsx
import React from "react";

export default function RequestCardSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-56" />
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="skeleton h-5 w-12 rounded-full" />
            <div className="skeleton h-5 w-28 rounded-full" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <div className="skeleton h-8 w-20 rounded-md" />
          <div className="skeleton h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
