// client/src/api/requestApi.js
import { apiRequest } from "./apiClient.js";

// Create donation request
export function createDonationRequestApi(payload) {
  return apiRequest("/api/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Logged-in user's own requests (as requester)
export function getMyDonationRequestsApi({ page = 1, limit = 10, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  return apiRequest(`/api/requests/my?${params.toString()}`);
}

// Admin: all requests
export function getAllDonationRequestsApi({ page, limit, status } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (status) params.set("status", status);
  const qs = params.toString();
  const path = qs ? `/api/requests/all?${qs}` : "/api/requests/all";
  return apiRequest(path);
}

// Public: pending requests
export function getPublicPendingRequestsApi({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  return apiRequest(`/api/requests/pending-public?${params.toString()}`);
}

// Volunteer: requests assigned to logged-in volunteer (as donor)
export function getVolunteerRequestsApi({ page, limit, status } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (status) params.set("status", status);
  const qs = params.toString();
  const path = qs
    ? `/api/requests/volunteer/my?${qs}`
    : "/api/requests/volunteer/my";
  return apiRequest(path);
}

// Get a single request by id
export function getDonationRequestByIdApi(id) {
  return apiRequest(`/api/requests/${id}`);
}

// Update request (owner/admin)
export function updateDonationRequestApi(id, payload) {
  return apiRequest(`/api/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Donor accepts a request
export function donateToRequestApi(id) {
  return apiRequest(`/api/requests/${id}/donate`, {
    method: "PATCH",
  });
}

// Change status (admin/owner/volunteer depending on backend rules)
export function changeDonationStatusApi(id, status) {
  return apiRequest(`/api/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Delete request (owner/admin)
export function deleteDonationRequestApi(id) {
  return apiRequest(`/api/requests/${id}`, {
    method: "DELETE",
  });
}
