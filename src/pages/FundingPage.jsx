// client/src/pages/FundingPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getFundingListApi,
  createPaymentIntentApi,
} from "../api/fundingApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

import {
  loadStripe
} from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Load publishable key from env
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const totalAmount = useMemo(
    () =>
      funds.reduce((sum, f) => sum + (Number(f.amount) || 0), 0),
    [funds]
  );

  const loadFunds = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFundingListApi();
      // assume backend returns array or {items:[]}
      const list = Array.isArray(data) ? data : data.items || [];
      setFunds(list);
    } catch (err) {
      setError(err.message || "Failed to load funding data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const startCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      const data = await createPaymentIntentApi(numericAmount);
      if (!data.clientSecret) {
        throw new Error("No clientSecret returned from server.");
      }
      setClientSecret(data.clientSecret);
      setShowCheckout(true);
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to start payment.");
    }
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold">Funding</h2>
          <p className="text-xs text-slate-500">
            This page shows all funds contributed to the organization. You can
            also give a fund using Stripe.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase text-slate-500">Total Funds</p>
          <p className="text-lg font-semibold">
            {totalAmount.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">
              (BDT)
            </span>
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-3">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert alert-success mb-3">
          <span>{message}</span>
        </div>
      )}

      {/* Give fund form */}
      <div className="mb-6 border border-base-300 rounded-xl p-4 flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="label">
            <span className="label-text text-xs">Amount to fund (BDT)</span>
          </label>
          <input
            type="number"
            min="1"
            className="input input-bordered input-sm w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount, e.g. 500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Payment will be processed securely using Stripe. Your name & email:
            {` ${user?.name || ""} (${user?.email || ""})`}
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm md:mb-1"
          onClick={startCheckout}
        >
          Give Fund
        </button>
      </div>

      {/* Stripe checkout section */}
      {showCheckout && clientSecret && (
        <div className="mb-6 border border-base-300 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-2">
            Complete Payment – {amount} BDT
          </h3>
          {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <CheckoutForm
                amount={amount}
                onSuccess={() => {
                  setMessage("Payment successful. Thank you for your support!");
                  setError("");
                  setShowCheckout(false);
                  setAmount("");
                  setClientSecret("");
                  loadFunds();
                }}
                onError={(msg) => {
                  setError(msg || "Payment failed.");
                }}
              />
            </Elements>
          ) : (
            <p className="text-xs text-red-500">
              Stripe publishable key is not set (VITE_STRIPE_PUBLISHABLE_KEY).
            </p>
          )}
        </div>
      )}

      {/* Funding table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : funds.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">
            No funds have been recorded yet.
          </p>
        ) : (
          <table className="table table-sm md:table-md">
            <thead>
              <tr>
                <th>#</th>
                <th>Contributor</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((f, idx) => (
                <tr key={f._id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {f.user?.name || f.name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {f.user?.email || f.email || ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {(Number(f.amount) || 0).toLocaleString()} BDT
                    </span>
                  </td>
                  <td className="text-xs">{formatDate(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stripe Checkout Form
// ─────────────────────────────────────────────
function CheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    onError && onError("");

    try {
      const card = elements.getElement(CardElement);
      if (!card) {
        onError && onError("Card element not found.");
        setSubmitting(false);
        return;
      }

      const result = await stripe.confirmCardPayment(
        // clientSecret is already wired via Elements options
        "",
        {
          payment_method: {
            card,
          },
        }
      );

      if (result.error) {
        console.error(result.error);
        onError && onError(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess && onSuccess();
      } else {
        onError && onError("Payment was not completed.");
      }
    } catch (err) {
      console.error(err);
      onError && onError(err.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <div className="border rounded-lg p-3 bg-base-200">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={!stripe || submitting}
      >
        {submitting
          ? "Processing…"
          : `Pay ${amount} BDT`}
      </button>
    </form>
  );
}
