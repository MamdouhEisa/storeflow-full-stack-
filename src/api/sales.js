import api from "./client";

const DEFAULT_PAGE_SIZE = 100;

function mapSaleFromApi(sale) {
  if (!sale) return null;
  const items = Array.isArray(sale.items)
    ? sale.items.map((item) => ({
        productId: item.product?._id || item.product || "",
        name: item.name || "",
        qty: Number(item.qty || 0),
        price: Number(item.price || 0),
        cost: Number(item.cost || 0),
      }))
    : [];

  return {
    id: sale.invoiceNumber || sale._id || sale.id,
    createdAt: sale.createdAt || sale.date || new Date().toISOString(),
    branch: sale.branch?.name || sale.branch?.location || sale.branch || "",
    status: sale.status || "completed",
    paymentType: sale.paymentType || "cash",
    discount: Number(sale.discount || 0),
    tax: Number(sale.tax || 0),
    items,
    subtotal: Number(sale.subtotal || 0),
    totalCost: Number(sale.totalCost || 0),
    totalAmount: Number(sale.totalAmount || 0),
    totalProfit: Number(sale.totalProfit || 0),
    profitMargin: Number(sale.profitMargin || 0),
  };
}

function mapSaleToApi(payload) {
  return {
    branch: payload.branch,
    items: (payload.items || []).map((item) => ({
      productId: item.productId,
      qty: item.qty,
      price: item.price,
      cost: item.cost,
    })),
    discount: payload.discount || 0,
    tax: payload.tax || 0,
    paymentType: payload.paymentType || "cash",
  };
}

export async function fetchSales({ page = 1, limit = DEFAULT_PAGE_SIZE, status } = {}) {
  const params = { page, limit };
  if (status && status !== "all") params.status = status;
  const response = await api.get("/api/sales", { params });
  const data = response.data;
  const items = Array.isArray(data?.data) ? data.data : [];
  return {
    sales: items.map(mapSaleFromApi).filter(Boolean),
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || items.length,
  };
}

export async function fetchSaleById(saleId) {
  if (!saleId) return null;
  const response = await api.get(`/api/sales/${saleId}`);
  const sale = response.data?.sale || response.data?.data;
  return mapSaleFromApi(sale);
}

export async function createSale(payload) {
  const response = await api.post("/api/sales", mapSaleToApi(payload));
  const sale = response.data?.sale || response.data?.data;
  return mapSaleFromApi(sale);
}

export async function returnFullSale(saleId) {
  const response = await api.patch(`/api/sales/${saleId}/return`);
  const sale = response.data?.sale || response.data?.data;
  return mapSaleFromApi(sale);
}

export async function returnSaleItem(saleId, productId) {
  const response = await api.patch(`/api/sales/${saleId}/return-item`, { productId });
  const sale = response.data?.sale || response.data?.data;
  return mapSaleFromApi(sale);
}
