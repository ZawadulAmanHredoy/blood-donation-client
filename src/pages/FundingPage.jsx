// client/src/pages/FundingPage.jsx
import { useEffect, useMemo, useState } from "react";
import { getFundingListApi, dummyPayApi } from "../api/fundingApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleString();
}

export default function FundingPage() {
  const { user } = useAuth();

  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState(1000);
  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalFunds = useMemo(() => {
    return funds.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [funds]);

  const loadFunds = async () => {
    setLoading(true);
    try {
      const data = await getFundingListApi();
      setFunds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load funds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const handleDummyPay = async () => {
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setPaying(true);
    try {
      await dummyPayApi(numericAmount);
      setSuccess("Dummy payment successful ✅");
      await loadFunds();
    } catch (err) {
      setError(err.message || "Dummy payment failed.");
    } finally {
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
        Dummy funding system (no Stripe, no card). Clicking the button will save
        a funding record in the database.
      </p>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
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

        <button
          className="btn btn-primary"
          onClick={handleDummyPay}
          disabled={paying}
        >
          {paying ? "Processing..." : "Confirm Dummy Payment"}
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
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
                    <td>{f.user?.name || f.name || "N/A"}</td>
                    <td>{f.user?.email || f.email || "N/A"}</td>
                    <td>{f.amount}</td>
                    <td>{f.status || "success"}</td>
                    <td>{formatDate(f.createdAt)}</td>
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
