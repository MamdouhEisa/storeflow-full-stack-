import api from "./client";

export async function fetchDashboard() {
  const response = await api.get("/api/analytics/dashboard");
  return response.data?.data || {};
}

export async function fetchProfitStats(period = "today") {
  const response = await api.get("/api/analytics/profit", { params: { period } });
  return response.data?.data || {};
}
