// client/src/api/requestApi.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER_URL ||
  ""; // keep "" to allow same-origin / proxy setups

function getToken() {
  // Adjust if your app stores token under a different key
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function http(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function withQuery(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

// Public: GET /api/requests/pending-public
export function getPublicPendingRequestsApi({ page = 1, limit = 10 } = {}) {
  return http(withQuery("/api/requests/pending-public", { page, limit }));
}

// Donor (auth): POST /api/requests
export function createDonationRequestApi(payload) {
  return http("/api/requests", { method: "POST", body: payload, auth: true });
}

// Requester (auth): GET /api/requests/my
export function getMyDonationRequestsApi({ page = 1, limit = 10, status } = {}) {
  return http(withQuery("/api/requests/my", { page, limit, status }), {
    auth: true,
  });
}

// Volunteer (auth): GET /api/requests/volunteer/my
export function getVolunteerRequestsApi({
  page = 1,
  limit = 10,
  status,
} = {}) {
  return http(withQuery("/api/requests/volunteer/my", { page, limit, status }), {
    auth: true,
  });
}

// Admin (auth): GET /api/requests/all
export function getAllDonationRequestsApi({
  page = 1,
  limit = 10,
  status,
} = {}) {
  return http(withQuery("/api/requests/all", { page, limit, status }), {
    auth: true,
  });
}

// Auth: GET /api/requests/:id
export function getDonationRequestByIdApi(id) {
  if (!id) throw new Error("Request id is required");
  return http(`/api/requests/${id}`, { auth: true });
}

// Owner/Admin (auth): PUT /api/requests/:id
export function updateDonationRequestApi(id, payload) {
  if (!id) throw new Error("Request id is required");
  return http(`/api/requests/${id}`, { method: "PUT", body: payload, auth: true });
}

// Donor (auth): PATCH /api/requests/:id/donate
export function donateToRequestApi(id) {
  if (!id) throw new Error("Request id is required");
  return http(`/api/requests/${id}/donate`, { method: "PATCH", auth: true });
}

// Admin/Owner/Donor (auth): PATCH /api/requests/:id/status  body: { status }
export function changeDonationStatusApi(id, status) {
  if (!id) throw new Error("Request id is required");
  if (!status) throw new Error("Status is required");
  return http(`/api/requests/${id}/status`, {
    method: "PATCH",
    body: { status },
    auth: true,
  });
}

// Owner/Admin (auth): DELETE /api/requests/:id
export function deleteDonationRequestApi(id) {
  if (!id) throw new Error("Request id is required");
  return http(`/api/requests/${id}`, { method: "DELETE", auth: true });
}
