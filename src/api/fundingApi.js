// client/src/api/fundingApi.js
import { apiRequest } from "./apiClient.js";

export const getFundingsApi = () => apiRequest("/api/funding");

export const createCheckoutSessionApi = (payload) =>
  apiRequest("/api/funding/create-checkout-session", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyCheckoutSessionApi = (payload) =>
  apiRequest("/api/funding/verify-checkout-session", {
    method: "POST",
    body: JSON.stringify(payload),
  });
