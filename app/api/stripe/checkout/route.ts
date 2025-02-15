import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { container } from "@/lib/di/container";
import type { IPaymentService } from "@/lib/services/interfaces/payment.service";
import type { IOrderService } from "@/lib/services/interfaces/order.service";
import type { ICartService } from "@/lib/services/interfaces/cart.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentService = container.resolve<IPaymentService>("PaymentService");
    const orderService = container.resolve<IOrderService>("OrderService");
    const cartService = container.resolve<ICartService>("CartService");

    const order = await orderService.findByStripeSessionId(sessionId);
    if (!order) {
      throw new Error("注文が見つかりません。");
    }

    if (session.payment_status === "paid") {
      await paymentService.handlePaymentSuccess(session);
      await cartService.clearCart(order.userId);
      return NextResponse.redirect(new URL("/orders/" + order.id, request.url));
    }

    return NextResponse.redirect(new URL("/orders/" + order.id, request.url));
  } catch (error) {
    console.error("チェックアウト処理中にエラーが発生しました:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
