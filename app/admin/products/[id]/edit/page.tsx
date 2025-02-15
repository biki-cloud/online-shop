import { notFound } from "next/navigation";
import { getProduct } from "@/app/actions/product";
import { checkAdmin } from "@/lib/auth/middleware";
import { AdminProductForm } from "@/components/admin/products/product-form";

interface Props {
  params: {
    id: string;
  };
}

export default async function AdminProductEditPage({ params }: Props) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    notFound();
  }

  const product = await getProduct(Number(params.id));
  if (!product) {
    notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">商品の編集</h1>
      <AdminProductForm product={product} />
    </div>
  );
}
