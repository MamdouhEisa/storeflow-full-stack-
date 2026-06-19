import api from "./client";

const DEFAULT_PAGE_SIZE = 200;

function mapTransferFromApi(transfer) {
  if (!transfer) return null;
  return {
    id: transfer._id || transfer.id,
    fromBranch: transfer.fromBranch?.name || transfer.fromBranch?.location || transfer.fromBranch || "",
    toBranch: transfer.toBranch?.name || transfer.toBranch?.location || transfer.toBranch || "",
    productId: transfer.product?._id || transfer.product || "",
    productName: transfer.product?.name || "",
    quantity: Number(transfer.quantity || 0),
    status: transfer.status || "pending",
    createdBy: transfer.createdBy?.username || "",
    approvedBy: transfer.approvedBy?.username || "",
    rejectedBy: transfer.rejectedBy?.username || "",
    createdAt: transfer.createdAt || "",
  };
}

export async function fetchTransfers({ page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const response = await api.get("/api/transfers", { params: { page, limit } });
  const data = response.data;
  const items = Array.isArray(data?.data) ? data.data : [];
  return {
    transfers: items.map(mapTransferFromApi).filter(Boolean),
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || items.length,
  };
}

export async function createTransfer(payload) {
  const response = await api.post("/api/transfers", payload);
  const transfer = response.data?.transfer || response.data?.data;
  return mapTransferFromApi(transfer);
}

export async function approveTransfer(transferId) {
  const response = await api.patch(`/api/transfers/${transferId}/approve`);
  const transfer = response.data?.transfer || response.data?.data;
  return mapTransferFromApi(transfer);
}

export async function rejectTransfer(transferId) {
  const response = await api.patch(`/api/transfers/${transferId}/reject`);
  const transfer = response.data?.transfer || response.data?.data;
  return mapTransferFromApi(transfer);
}
