import { getCategories } from "@/app/actions/category";
import { CategoryList } from "@/components/admin/category/category-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminCategoryPage() {
  const categories = await getCategories();

  return (
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="カテゴリー管理" description="商品カテゴリーの管理" />
        <Button asChild>
          <Link href="/admin/category/new">新規カテゴリー</Link>
        </Button>
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
