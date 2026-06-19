import api from "./client";

const DEFAULT_PAGE_SIZE = 100;

function mapProductFromApi(product) {
  if (!product) return null;
  const branchValue =
    product.branch?.name ||
    product.branch?.location ||
    product.branchName ||
    product.branch ||
    "";

  return {
    id: product._id || product.id,
    name: product.name || "",
    code: product.code || product.sku || product.productCode || "",
    branch: branchValue,
    purchasePrice: Number(product.purchasePrice ?? 0),
    sellingPrice: Number(product.sellingPrice ?? 0),
    stock: Number(product.quantity ?? product.stock ?? 0),
    imageUrl: product.imageUrl || "",
    minStock: Number(product.minStock ?? 10),
  };
}

function mapProductToApi(payload) {
  return {
    name: payload.productName || payload.name || "",
    code: payload.productCode || payload.code || "",
    branch: payload.branch || "",
    quantity: payload.initialStock ?? payload.stock ?? payload.quantity ?? 0,
    purchasePrice: payload.purchasePrice ?? 0,
    sellingPrice: payload.sellingPrice ?? 0,
    imageUrl: payload.imageUrl || "",
    minStock: payload.minStock ?? 10,
  };
}

export async function fetchProducts({ page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
  const response = await api.get("/api/products", { params: { page, limit } });
  const data = response.data;
  const items = Array.isArray(data?.data) ? data.data : [];
  return {
    products: items.map(mapProductFromApi).filter(Boolean),
    page: data?.page || page,
    pages: data?.pages || 1,
    total: data?.total || items.length,
    alerts: data?.alerts || [],
  };
}

export async function fetchProductById(productId) {
  if (!productId) return null;
  const response = await api.get(`/api/products/${productId}`);
  const product = response.data?.product || response.data?.data;
  return mapProductFromApi(product);
}

export async function createProduct(payload) {
  const response = await api.post("/api/products", mapProductToApi(payload));
  const product = response.data?.product || response.data?.data;
  return mapProductFromApi(product);
}

export async function updateProduct(productId, payload) {
  if (!productId) return null;
  const response = await api.put(`/api/products/${productId}`, mapProductToApi(payload));
  const product = response.data?.product || response.data?.data;
  return mapProductFromApi(product);
}

export async function patchProduct(productId, patch) {
  if (!productId) return null;
  const response = await api.put(`/api/products/${productId}`, patch);
  const product = response.data?.product || response.data?.data;
  return mapProductFromApi(product);
}

export async function deleteProduct(productId) {
  if (!productId) return false;
  await api.delete(`/api/products/${productId}`);
  return true;
}

export async function updateProductQuantity(productId, quantity) {
  return patchProduct(productId, { quantity });
}
