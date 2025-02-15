import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, calculateOrderAmount } from "@/lib/utils";
import { container } from "@/lib/di/container";
import type { CartItem } from "@/lib/domain/cart";
import type { Product } from "@/lib/domain/product";
import type { ICartService } from "@/lib/services/interfaces/cart.service";
import type { IPaymentService } from "@/lib/services/interfaces/payment.service";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const cartService = container.resolve<ICartService>("CartService");

  const cart = await cartService.findActiveCart(session.user.id);
  if (!cart) {
    redirect("/cart");
  }

  const cartItems = (await cartService.getCartItems(cart.id)) as (CartItem & {
    product: Product | null;
  })[];
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce((acc: number, item) => {
    if (!item.product) return acc;
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  const { tax, total } = calculateOrderAmount(subtotal);

  async function handleCheckout() {
    "use server";

    const currentSession = await getSession();
    if (!currentSession?.user) return;

    const paymentService = container.resolve<IPaymentService>("PaymentService");
    await paymentService.processCheckout(currentSession.user.id);
  }

  return (
    <div className="container max-w-2xl py-24">
      <Card>
        <CardHeader>
          <CardTitle>チェックアウト</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      数量: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {item.product &&
                    formatPrice(
                      Number(item.product.price) * item.quantity,
                      item.product.currency
                    )}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>小計</div>
              <div>{formatPrice(subtotal, "JPY")}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>消費税</div>
              <div>{formatPrice(tax, "JPY")}</div>
            </div>
            <div className="flex items-center justify-between font-medium">
              <div>合計</div>
              <div>{formatPrice(total, "JPY")}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form action={handleCheckout} className="w-full">
            <Button type="submit" className="w-full">
              注文を確定する
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
