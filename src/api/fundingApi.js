// client/src/api/fundingApi.js
import { apiRequest } from "./apiClient.js";

// Create Stripe payment
export function createPaymentIntentApi(amount) {
  return apiRequest("/api/funding/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

// Record successful payment
export function recordFundingApi(amount) {
  return apiRequest("/api/funding/record", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

// Current user's funding
export function getMyFundingApi({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  return apiRequest(`/api/funding/my?${params.toString()}`);
}

// Admin/Volunteer: all funding
export function getAllFundingApi({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  return apiRequest(`/api/funding/all?${params.toString()}`);
}

// Total funding (dashboard stat)
export function getTotalFundingApi() {
  return apiRequest("/api/funding/total");
}
