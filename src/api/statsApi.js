// client/src/api/statsApi.js
import { apiRequest } from "./apiClient.js";

export function getDashboardSummaryApi() {
  return apiRequest("/api/stats/summary");
}
