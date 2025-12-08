// client/src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getPublicPendingRequestsApi } from "../api/requestApi.js";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [liveRequests, setLiveRequests] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    const loadLive = async () => {
      setLiveLoading(true);
      setLiveMessage("");

      try {
        const data = await getPublicPendingRequestsApi({ page: 1, limit: 3 });
        const items = Array.isArray(data) ? data : data.items || [];
        setLiveRequests(items);
        if (items.length === 0) {
          setLiveMessage("No live requests right now.");
        }
      } catch (err) {
        setLiveMessage(err.message || "Failed to load live requests.");
      } finally {
        setLiveLoading(false);
      }
    };

    loadLive();
  }, []);

  const handleViewRequest = (id) => {
    const target = `/dashboard/requests/${id}`;
    if (isAuthenticated) {
      navigate(target);
    } else {
      navigate("/login", { state: { from: { pathname: target } } });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-10">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold uppercase tracking-wide">
            Donate blood • Save lives
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            A single drop of <span className="text-red-500">hope</span>
            <br /> can change a life forever.
          </h1>

          <p className="text-slate-600 max-w-xl">
            Lifeline connects voluntary donors with those in urgent need of
            blood. Track your donations, manage requests, and support your
            community with a modern, easy-to-use platform.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary">
              Join as Donor
            </Link>
            <Link to="/search-donors" className="btn btn-outline">
              Search Donors
            </Link>
            <Link
              to="/donation-requests"
              className="btn btn-ghost text-xs md:text-sm"
            >
              View All Requests
            </Link>
          </div>

          <div className="flex gap-6 pt-4 text-sm">
            <HomeStat label="Active Donors" value="120+" />
            <HomeStat label="Successful Donations" value="340+" />
            <HomeStat label="24/7 Support" value="24/7" />
          </div>
        </div>

        {/* Right side: Live requests from backend */}
        <div className="relative">
          <div className="rounded-3xl bg-gradient-to-br from-red-500/10 via-sky-500/10 to-white p-1 shadow-lg">
            <div className="rounded-3xl bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-500 font-semibold">
                    Live Requests
                  </p>
                  <p className="text-xs text-slate-400">Pending</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-semibold">
                  Urgent
                </span>
              </div>

              {liveLoading ? (
                <div className="flex justify-center items-center py-6">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : liveRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  {liveMessage || "No live requests to show."}
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  {liveRequests.map((req) => (
                    <LiveRequestRow
                      key={req._id}
                      blood={req.bloodGroup}
                      hospital={req.hospitalName}
                      location={`${req.recipient?.upazila || ""}${
                        req.recipient?.district
                          ? ", " + req.recipient.district
                          : ""
                      }`}
                      time={`${req.donationDate} • ${req.donationTime}`}
                      onView={() => handleViewRequest(req._id)}
                    />
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Matched donors are notified instantly.</span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="pt-2 text-right">
                <Link
                  to="/donation-requests"
                  className="text-[11px] text-red-500 font-semibold"
                >
                  View all requests →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why use Lifeline */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold">Why use Lifeline?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon="⚡"
            title="Fast matching"
            text="Filter donors by blood group, district and upazila to find help quickly when it matters most."
            color="red"
          />
          <FeatureCard
            icon="🛡️"
            title="Trusted profiles"
            text="Donors manage their own profiles while admins and volunteers keep the community safe."
            color="blue"
          />
          <FeatureCard
            icon="📊"
            title="Clear tracking"
            text="Track requests from pending to completed, and view your history of life-saving donations."
            color="amber"
          />
        </div>
      </section>
    </div>
  );
}

function HomeStat({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function LiveRequestRow({ blood, hospital, location, time, onView }) {
  return (
    <div className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-slate-50 transition">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xs font-bold">
          {blood}
        </div>
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{hospital}</p>
          <p className="text-slate-500">{location}</p>
        </div>
      </div>
      <div className="flex flex-col items-end text-xs text-slate-500">
        <span>{time}</span>
        <button
          onClick={onView}
          className="text-red-500 font-semibold text-[11px]"
        >
          View
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text, color = "slate" }) {
  const colorMap = {
    red: "bg-red-50",
    blue: "bg-sky-50",
    amber: "bg-amber-50",
    slate: "bg-slate-100",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${
          colorMap[color] || "bg-slate-100"
        }`}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
