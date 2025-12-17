// client/src/pages/FundingPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  createCheckoutSessionApi,
  getFundingsApi,
  verifyCheckoutSessionApi,
} from "../api/fundingApi.js";

export default function FundingPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState(1000);
  const [funds, setFunds] = useState([]);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalFunds = useMemo(() => {
    return funds.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [funds]);

  const loadFunds = async () => {
    setLoadingFunds(true);
    try {
      const data = await getFundingsApi();
      setFunds(Array.isArray(data) ? data : []);
    } finally {
      setLoadingFunds(false);
    }
  };

  // 1) Load funding list
  useEffect(() => {
    loadFunds();
  }, []);

  // 2) If redirected back from Stripe success, verify and save record
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    const run = async () => {
      setError("");
      setMessage("");

      if (canceled) {
        setMessage("Payment canceled.");
        // clean URL
        setSearchParams({});
        return;
      }

      if (success && sessionId) {
        try {
          setMessage("Verifying payment…");
          await verifyCheckoutSessionApi({ sessionId });
          setMessage("Payment successful ✅ Funding recorded.");
          await loadFunds();
        } catch (err) {
          setError(err.message || "Failed to verify payment.");
        } finally {
          // clean URL
          setSearchParams({});
        }
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    setError("");
    setMessage("");

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setPaying(true);
    try {
      const res = await createCheckoutSessionApi({ amount: numericAmount });
      if (!res?.url) throw new Error("Failed to get Stripe checkout URL.");

      // Redirect to Stripe hosted checkout
      window.location.href = res.url;
    } catch (err) {
      setError(err.message || "Failed to start checkout.");
      setPaying(false);
    }
  };

  return (
    <div className="bg-base-100 shadow-lg rounded-xl p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Funding</h2>
        <div className="text-right">
          <p className="text-xs text-slate-500">TOTAL FUNDS</p>
          <p className="text-lg font-bold">{totalFunds} BDT</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        This page shows all funds contributed to the organization. You can also
        give a fund using Stripe Checkout.
      </p>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="alert alert-success mb-4">
          <span>{message}</span>
        </div>
      )}

      <div className="bg-base-200 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="label">
            <span className="label-text">Amount to fund (BDT)</span>
          </label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
          />
          <p className="text-xs text-slate-500 mt-1">
            Your name & email: {user?.name} ({user?.email})
          </p>
        </div>

        <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
          {paying ? "Redirecting..." : "Pay with Stripe"}
        </button>
      </div>

      <div className="mt-6">
        {loadingFunds ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : funds.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No funds have been recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm md:table-md">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Email</th>
                  <th>Amount (BDT)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f, idx) => (
                  <tr key={f._id}>
                    <td>{idx + 1}</td>
                    <td>{f.name || f.user?.name || "N/A"}</td>
                    <td>{f.email || f.user?.email || "N/A"}</td>
                    <td>{f.amount}</td>
                    <td>{f.status}</td>
                    <td>{new Date(f.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
