"use client";

import { Product } from "@/lib/infrastructure/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface AdminProductDetailProps {
  product: Product;
}

export function AdminProductDetail({ product }: AdminProductDetailProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">商品詳細</CardTitle>
        <div className="space-x-2">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="outline">編集</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost">一覧に戻る</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">商品名</h3>
              <p className="text-lg">{product.name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">説明</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">価格</h3>
              <p className="text-lg">¥{product.price.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">在庫数</h3>
              <p className="text-lg">{product.stock}個</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">商品画像</h3>
            {product.imageUrl ? (
              <div className="relative aspect-square">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                <p className="text-gray-400">画像なし</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
