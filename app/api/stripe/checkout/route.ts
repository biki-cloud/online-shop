import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";
import { PaymentService } from "@/lib/services/payment.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/cart", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const container = createContainer(db);
    const paymentService = new PaymentService(
      container.paymentRepository,
      container.cartRepository,
      container.orderRepository
    );

    const orders = await container.orderRepository.findAll();
    const order = orders.find((o) => o.stripeSessionId === sessionId);

    if (!order) {
      throw new Error("Order not found for this session.");
    }

    if (session.payment_status === "paid") {
      await paymentService.handlePaymentSuccess(session);
      await container.cartRepository.clearCart(order.userId);
      return NextResponse.redirect(new URL("/orders/" + order.id, request.url));
    }

    return NextResponse.redirect(new URL("/orders/" + order.id, request.url));
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
