import { notFound } from "next/navigation";
import { getCategoryById } from "@/app/actions/category";
import { CategoryForm } from "@/components/admin/category/category-form";
import { PageHeader } from "@/components/page-header";

interface AdminEditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function AdminEditCategoryPage({
  params,
}: AdminEditCategoryPageProps) {
  const category = await getCategoryById(parseInt(params.id));

  if (!category) {
    notFound();
  }

  return (
    <div className="container space-y-8">
      <PageHeader title="カテゴリー編集" description="カテゴリー情報の編集" />
      <div className="mx-auto max-w-2xl">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
