import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { getCartItems } from "@/lib/db/queries/cart";
import { calculateOrderAmount } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { createOrder, createOrderItems } from "@/lib/db/queries/orders";
import { getUser } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const user = await getUser(session.user.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Stripe customer not found" },
        { status: 400 }
      );
    }

    const cartItems = await getCartItems(session.user.id);
    if (!cartItems.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product!.price) * item.quantity,
      0
    );

    const { total } = calculateOrderAmount(subtotal);

    const order = await createOrder({
      userId: session.user.id,
      status: "pending",
      totalAmount: total.toString(),
      currency: "JPY",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      shippingAddress: null,
    });

    await createOrderItems(
      cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
        currency: item.product!.currency,
      }))
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "jpy",
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        orderId: order.id.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
