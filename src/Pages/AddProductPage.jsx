import ProductFormPage from "./ProductForm";
import { createProduct } from "../api/products";

export default function AddProductPage({ routerNavigate }) {
  return (
    <ProductFormPage
      mode="add"
      routerNavigate={routerNavigate}
      title="Add New Product"
      submitLabel="Add Product"
      onSubmit={(payload) => createProduct(payload)}
    />
  );
}
