import { notFound } from "next/navigation";
import { getProductById } from "@/app/actions/product";
import { AdminProductDetail } from "@/components/admin/products/product-detail";
import { checkAdmin } from "@/lib/auth/middleware";

interface Props {
  params: {
    id: string;
  };
}

export default async function AdminProductDetailPage({ params }: Props) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    notFound();
  }

  const product = await getProductById(Number(params.id));
  if (!product) {
    notFound();
  }

  return (
    <div className="container py-6">
      <AdminProductDetail product={product} />
    </div>
  );
}
