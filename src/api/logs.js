import api from "./client";

export async function fetchLogs({ page = 1, limit = 50, action, startDate, endDate } = {}) {
  const params = { page, limit };
  if (action) params.action = action;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get("/api/logs", { params });
  const data = response.data;
  return {
    logs: Array.isArray(data?.data) ? data.data : [],
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || 0,
  };
}
