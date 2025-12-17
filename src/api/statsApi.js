// client/src/api/statsApi.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

/**
 * Dashboard summary cards
 * GET /api/stats/summary
 */
export function getDashboardSummaryApi() {
  return request("/api/stats/summary");
}

/**
 * Charts data (daily / weekly / monthly)
 * GET /api/stats/requests
 */
export function getRequestStatsApi() {
  return request("/api/stats/requests");
}
