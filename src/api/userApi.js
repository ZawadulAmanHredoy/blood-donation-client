// client/src/api/userApi.js

// Base URL for your backend API
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper: get token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Helper: generic request wrapper
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

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* ────────────────────────────────────────────
   PROFILE: used by ProfilePage.jsx
   ──────────────────────────────────────────── */

// GET /api/users/me – current logged in user
export function getMeApi() {
  return request("/api/users/me");
}

// PATCH /api/users/me – update own profile
export function updateProfileApi(payload) {
  return request("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/* ────────────────────────────────────────────
   ADMIN: Manage Users (AdminUsers.jsx)
   ──────────────────────────────────────────── */

// GET /api/users – list all users (admin)
export function getAllUsersApi(params = {}) {
  const search = new URLSearchParams();
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", params.page);
  if (params.limit) search.set("limit", params.limit);

  const qs = search.toString();
  const url = qs ? `/api/users?${qs}` : "/api/users";

  return request(url);
}

// PATCH /api/users/:id/block
export function blockUserApi(userId) {
  return request(`/api/users/${userId}/block`, {
    method: "PATCH",
  });
}

// PATCH /api/users/:id/unblock
export function unblockUserApi(userId) {
  return request(`/api/users/${userId}/unblock`, {
    method: "PATCH",
  });
}

// PATCH /api/users/:id/make-admin
export function makeAdminApi(userId) {
  return request(`/api/users/${userId}/make-admin`, {
    method: "PATCH",
  });
}

// PATCH /api/users/:id/make-volunteer
export function makeVolunteerApi(userId) {
  return request(`/api/users/${userId}/make-volunteer`, {
    method: "PATCH",
  });
}

/* ────────────────────────────────────────────
   PUBLIC / DONOR SEARCH (SearchDonors.jsx)
   ──────────────────────────────────────────── */

// GET /api/users/search-donors?bloodGroup=&district=&upazila=
export function searchDonorsApi({ bloodGroup, district, upazila } = {}) {
  const search = new URLSearchParams();
  if (bloodGroup) search.set("bloodGroup", bloodGroup);
  if (district) search.set("district", district);
  if (upazila) search.set("upazila", upazila);

  const qs = search.toString();
  const url = qs ? `/api/users/search-donors?${qs}` : "/api/users/search-donors";

  return request(url, { auth: false }); // public endpoint
}
