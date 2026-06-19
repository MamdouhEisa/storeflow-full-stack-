import { useEffect, useMemo, useState } from "react";
import ProductFormPage from "./ProductForm";
import { fetchProductById, updateProduct } from "../api/products";

export default function EditProductPage({ productId, routerNavigate }) {
  const resolvedId = useMemo(() => {
    if (productId) return productId;
    if (typeof window === "undefined") return "";

    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }, [productId]);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!resolvedId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchProductById(resolvedId);
        if (!isMounted) return;
        setProduct(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load product.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [resolvedId]);

  const initialValues = product
    ? {
        productName: product.name,
        productCode: product.code,
        branch: product.branch,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        initialStock: product.stock,
        imageUrl: product.imageUrl || "",
      }
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-[#23262b] sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3] p-10 text-center">
          <p className="text-base text-[#80858d]">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-[#23262b] sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#f3c5c5] p-10 text-center">
          <p className="text-base text-[#b42323]">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-[#23262b] sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3] p-10 text-center">
          <p className="text-base text-[#80858d]">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <ProductFormPage
      mode="edit"
      routerNavigate={routerNavigate}
      title={`Edit ${product.name}`}
      submitLabel="Save Changes"
      initialValues={initialValues}
      onSubmit={(payload) => (resolvedId ? updateProduct(resolvedId, payload) : null)}
    />
  );
}
