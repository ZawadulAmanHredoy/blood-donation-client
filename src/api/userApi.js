// client/src/api/userApi.js
import { apiRequest } from "./apiClient.js";

// Profile
export function getProfileApi() {
  return apiRequest("/api/users/me");
}

export function updateProfileApi(payload) {
  return apiRequest("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Admin: list users
export function getAllUsersApi({ page = 1, limit = 10, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);

  return apiRequest(`/api/users?${params.toString()}`);
}

// Admin actions
export function blockUserApi(id) {
  return apiRequest(`/api/users/${id}/block`, { method: "PATCH" });
}

export function unblockUserApi(id) {
  return apiRequest(`/api/users/${id}/unblock`, { method: "PATCH" });
}

export function makeVolunteerApi(id) {
  return apiRequest(`/api/users/${id}/make-volunteer`, { method: "PATCH" });
}

export function makeAdminApi(id) {
  return apiRequest(`/api/users/${id}/make-admin`, { method: "PATCH" });
}

// Public: search donors
export function searchDonorsApi(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/api/users/search-donors?${params.toString()}`);
}
