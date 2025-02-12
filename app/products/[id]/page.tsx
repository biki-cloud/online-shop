import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/product-details";
import { getProductById } from "@/app/actions/product";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-8">
      <ProductDetails product={product} />
    </div>
  );
}
