"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem, Product } from "@/lib/infrastructure/db/schema";
import { formatPrice } from "@/lib/shared/utils";
import { useState } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/cart";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItemsProps {
  items: (CartItem & {
    product: Product | null;
  })[];
}

export function CartItems({ items }: CartItemsProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setLoading(itemId);
    await updateCartItemQuantity(itemId, quantity);
    setLoading(null);
    router.refresh();
  };

  const handleRemove = async (itemId: number) => {
    setLoading(itemId);
    await removeFromCart(itemId);
    setLoading(null);
    router.refresh();
  };

  if (items.length === 0) {
    return <p>カートは空です</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center space-x-4 border rounded-lg p-4"
        >
          <div className="relative w-24 h-24">
            <Image
              src={item.product?.imageUrl ?? ""}
              alt={item.product?.name ?? ""}
              fill
              className="object-cover rounded-md"
              sizes="96px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {item.product?.name ?? ""}
            </h3>
            <p className="text-sm text-gray-500">
              {item.product?.price && item.product?.currency
                ? formatPrice(Number(item.product.price), item.product.currency)
                : "-"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.id, parseInt(e.target.value))
              }
              className="w-20"
              min={1}
              disabled={loading === item.id}
            />
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemove(item.id)}
              disabled={loading === item.id}
            >
              {loading === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
