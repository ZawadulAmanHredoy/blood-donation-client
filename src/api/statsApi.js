// client/src/api/statsApi.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getRequestStatsApi() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/stats/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load stats");

  return data;
}
