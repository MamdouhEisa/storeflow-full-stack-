import api from "./client";

const DEFAULT_PAGE_SIZE = 200;

function normalizeStatus(value) {
  const raw = String(value || "Active").trim().toLowerCase();
  return raw === "inactive" ? "Inactive" : "Active";
}

function mapBranchFromApi(branch) {
  if (!branch) return null;
  return {
    id: branch._id || branch.id,
    name: branch.name || "",
    address: branch.address || branch.location || "",
    city: branch.city || "",
    email: branch.email || "",
    phone: branch.phone || "",
    manager: branch.manager || "",
    status: normalizeStatus(branch.status || "Active"),
  };
}

function mapBranchToApi(payload) {
  return {
    name: payload.branchName || payload.name || "",
    location: payload.streetAddress || payload.address || "",
    address: payload.streetAddress || payload.address || "",
    city: payload.city || "",
    email: payload.email || "",
    phone: payload.phone || "",
    manager: payload.branchManager || payload.manager || "",
    status: normalizeStatus(payload.status || "Active"),
  };
}

export async function fetchBranches({ page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const response = await api.get("/api/branches", { params: { page, limit } });
  const data = response.data;
  const items = Array.isArray(data?.data) ? data.data : [];
  return {
    branches: items.map(mapBranchFromApi).filter(Boolean),
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || items.length,
  };
}

export async function fetchBranchById(branchId) {
  if (!branchId) return null;
  const response = await api.get(`/api/branches/${branchId}`);
  const branch = response.data?.branch || response.data?.data;
  return mapBranchFromApi(branch);
}

export async function createBranch(payload) {
  const response = await api.post("/api/branches", mapBranchToApi(payload));
  const branch = response.data?.branch || response.data?.data;
  return mapBranchFromApi(branch);
}

export async function updateBranch(branchId, payload) {
  if (!branchId) return null;
  const response = await api.put(`/api/branches/${branchId}`, mapBranchToApi(payload));
  const branch = response.data?.branch || response.data?.data;
  return mapBranchFromApi(branch);
}

export async function deleteBranch(branchId) {
  if (!branchId) return false;
  await api.delete(`/api/branches/${branchId}`);
  return true;
}
