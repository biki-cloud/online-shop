"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/infrastructure/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProduct } from "@/app/actions/product";
import { toast } from "sonner";
import Image from "next/image";
import { uploadFile, deleteFile } from "@/lib/infrastructure/storage/storage";

interface AdminProductFormProps {
  product: Product;
}

export function AdminProductForm({ product }: AdminProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.imageUrl || null
  );
  const [currentFileName, setCurrentFileName] = useState<string | null>(() => {
    if (product.imageUrl) {
      try {
        return new URL(product.imageUrl).pathname.split("/").pop() || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 古い画像を削除
      if (currentFileName) {
        await deleteFile(currentFileName);
      }

      // 新しい画像をアップロード
      const { url, fileName } = await uploadFile(file);
      setImagePreview(url);
      setCurrentFileName(fileName);
    } catch (error) {
      toast.error("画像のアップロードに失敗しました");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const updatedProduct = await updateProduct(product.id, {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          price: formData.get("price") as string,
          stock: Number(formData.get("stock")),
          imageUrl: imagePreview,
        });

        if (updatedProduct) {
          toast.success("商品を更新しました");
          router.push(`/admin/products/${product.id}`);
          router.refresh();
        } else {
          toast.error("商品の更新に失敗しました");
        }
      } catch (error) {
        toast.error("エラーが発生しました");
        console.error(error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="name">商品名</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product.name}
          required
          maxLength={255}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product.description || ""}
          rows={5}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">価格</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={Number(product.price)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">在庫数</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step={1}
            defaultValue={product.stock}
            required
          />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="image">商品画像</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
        </div>
        {imagePreview && (
          <div className="relative aspect-square w-64">
            <Image
              src={imagePreview}
              alt="商品画像プレビュー"
              fill
              className="object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={async () => {
                if (currentFileName) {
                  try {
                    await deleteFile(currentFileName);
                    setImagePreview(null);
                    setCurrentFileName(null);
                  } catch (error) {
                    toast.error("画像の削除に失敗しました");
                    console.error(error);
                  }
                }
              }}
            >
              削除
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "更新中..." : "更新する"}
        </Button>
      </div>
    </form>
  );
}
