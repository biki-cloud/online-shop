import { createProductAction } from "@/app/actions/admin-products";
import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">新規商品登録</h2>
      <ProductForm onSubmit={createProductAction} />
    </div>
  );
}
