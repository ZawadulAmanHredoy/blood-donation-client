// client/src/api/userApi.js

// Base URL for your backend API
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

/* ────────────────────────────────────────────
   PROFILE (ProfilePage.jsx depends on these)
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

export function blockUserApi(userId) {
  return request(`/api/users/${userId}/block`, { method: "PATCH" });
}

export function unblockUserApi(userId) {
  return request(`/api/users/${userId}/unblock`, { method: "PATCH" });
}

export function makeAdminApi(userId) {
  return request(`/api/users/${userId}/make-admin`, { method: "PATCH" });
}

export function makeVolunteerApi(userId) {
  return request(`/api/users/${userId}/make-volunteer`, { method: "PATCH" });
}

/* ────────────────────────────────────────────
   PUBLIC DONOR SEARCH (PAGINATED ✅)
──────────────────────────────────────────── */

export function searchDonorsApi({
  bloodGroup,
  district,
  upazila,
  page = 1,
  limit = 10,
} = {}) {
  const search = new URLSearchParams();
  if (bloodGroup) search.set("bloodGroup", bloodGroup);
  if (district) search.set("district", district);
  if (upazila) search.set("upazila", upazila);

  search.set("page", page);
  search.set("limit", limit);

  return request(`/api/users/search-donors?${search.toString()}`, {
    auth: false, // public endpoint
  });
}
