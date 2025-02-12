"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/product";

interface DeleteProductButtonProps {
  productId: number;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      setIsLoading(true);
      const result = await deleteProduct(productId);
      if (result) {
        router.refresh();
      } else {
        alert("商品の削除に失敗しました");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("商品の削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除"}
    </Button>
  );
}
