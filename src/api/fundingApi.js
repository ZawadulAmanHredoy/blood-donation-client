// client/src/api/fundingApi.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// GET /api/funding  → list all funding entries
export function getFundingListApi() {
  return request("/api/funding");
}

// POST /api/funding/create-payment-intent  → create Stripe PaymentIntent
// amount is in minor units (e.g. 500 = $5.00) OR normal number (we'll treat as BDT)
export function createPaymentIntentApi(amount) {
  return request("/api/funding/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
