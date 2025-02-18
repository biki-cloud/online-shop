import { CategoryForm } from "@/components/admin/category/category-form";
import { PageHeader } from "@/components/page-header";

export default function AdminNewCategoryPage() {
  return (
    <div className="container space-y-8">
      <PageHeader title="新規カテゴリー" description="新しいカテゴリーを作成" />
      <div className="mx-auto max-w-2xl">
        <CategoryForm />
      </div>
    </div>
  );
}
