// client/src/api/fundingApi.js
import { apiRequest } from "./apiClient.js";

// GET /api/funding  → list all funding entries
export function getFundingListApi() {
  return apiRequest("/api/funding");
}

// POST /api/funding/dummy-pay → create a dummy funding entry (no Stripe)
export function dummyPayApi(amount) {
  return apiRequest("/api/funding/dummy-pay", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
