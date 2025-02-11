"use client";

import { Button } from "@/components/ui/button";

interface DeleteProductButtonProps {
  productId: number;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const handleDelete = async () => {
    // TODO: 削除機能の実装
    console.log("Delete product:", productId);
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      削除
    </Button>
  );
}
