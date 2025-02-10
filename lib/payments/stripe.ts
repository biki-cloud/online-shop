import Stripe from "stripe";
import { redirect } from "next/navigation";
import type { Cart, CartItem, Product } from "@/lib/db/schema";
import { calculateOrderAmount } from "@/lib/utils";
import {
  createOrder,
  createOrderItems,
  updateOrderStatus,
} from "@/lib/db/queries/orders";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function createCheckoutSession({
  userId,
  cart,
  cartItems,
}: {
  userId: number;
  cart: Cart | null;
  cartItems: (CartItem & { product: Product | null })[];
}) {
  if (!cartItems.length) {
    redirect("/cart");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product!.price) * item.quantity,
    0
  );

  const { total } = calculateOrderAmount(subtotal);

  const lineItems = cartItems
    .filter((item) => item.product !== null)
    .map((item) => {
      const priceWithTax = Math.round(Number(item.product!.price) * 1.1);
      return {
        price_data: {
          currency: item.product!.currency.toLowerCase(),
          product_data: {
            name: item.product!.name,
            description: item.product!.description || undefined,
            images: item.product!.imageUrl
              ? [item.product!.imageUrl]
              : undefined,
          },
          unit_amount: priceWithTax,
        },
        quantity: item.quantity,
      };
    });

  const order = await createOrder({
    userId,
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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/cart`,
    metadata: {
      orderId: order.id.toString(),
    },
  });

  await updateOrderStatus(order.id, "pending", null, session.id);

  redirect(session.url!);
}

export async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const orderId = Number(session.metadata?.orderId);
  if (!orderId) {
    throw new Error("注文IDが見つかりません。");
  }

  await updateOrderStatus(orderId, "paid", session.payment_intent as string);
}

export async function handlePaymentFailure(session: Stripe.Checkout.Session) {
  const orderId = Number(session.metadata?.orderId);
  if (!orderId) {
    throw new Error("注文IDが見つかりません。");
  }

  await updateOrderStatus(orderId, "failed");
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}
