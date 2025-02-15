import { redirect } from "next/navigation";
import { getSession } from "@/lib/infrastructure/auth/session";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import { container } from "@/lib/di/container";
import type { ICartService } from "@/lib/core/services/interfaces/cart.service";
import type { CartItem } from "@/lib/core/domain/cart";
import type { Product } from "@/lib/core/domain/product";

export default async function CartPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/sign-in");
  }

  const cartService = container.resolve<ICartService>("CartService");
  const cart = await cartService.findActiveCart(user.id);

  if (!cart) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">カート</h1>
        <p>カートは空です</p>
      </div>
    );
  }

  const cartItems = (await cartService.getCartItems(cart.id)) as (CartItem & {
    product: Product | null;
  })[];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">カート</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <CartItems items={cartItems} />
        </div>
        <div>
          <CartSummary items={cartItems} />
        </div>
      </div>
    </div>
  );
}
