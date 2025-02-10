import { db } from "@/lib/db/drizzle";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function ProductsPage() {
  const productList = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">商品一覧</h2>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          新規商品登録
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  商品名
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  価格
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  在庫
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {productList.map((product) => (
                <tr
                  key={product.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{product.id}</td>
                  <td className="p-4 align-middle">{product.name}</td>
                  <td className="p-4 align-middle">
                    {product.price.toLocaleString()} {product.currency}
                  </td>
                  <td className="p-4 align-middle">{product.stock}</td>
                  <td className="p-4 align-middle">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      編集
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        // TODO: 削除機能の実装
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
