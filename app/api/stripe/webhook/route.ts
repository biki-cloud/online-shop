import Stripe from "stripe";
import {
  handlePaymentSuccess,
  handlePaymentFailure,
  stripe,
} from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import { updateUserStripeCustomerId } from "@/lib/db/queries/users";
import { headers } from "next/headers";
import { updateOrderStatus } from "@/lib/db/queries/orders";
import { clearCart } from "@/lib/db/queries/cart";
import { getOrderById } from "@/lib/db/queries/orders";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const data = event.data.object as any;

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const orderId = data.metadata?.orderId;
        if (orderId) {
          await updateOrderStatus(Number(orderId), "paid", data.id);
          const order = await getOrderById(Number(orderId));
          if (order) {
            await clearCart(order.userId);
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedOrderId = data.metadata?.orderId;
        if (failedOrderId) {
          await updateOrderStatus(Number(failedOrderId), "failed");
        }
        break;

      case "checkout.session.completed":
        if (data.payment_status === "paid") {
          await handlePaymentSuccess(data);
        }
        break;

      case "checkout.session.expired":
        const expiredOrderId = data.metadata?.orderId;
        if (expiredOrderId) {
          await updateOrderStatus(Number(expiredOrderId), "expired");
        }
        break;

      case "setup_intent.succeeded":
        const setupIntent = data as Stripe.SetupIntent;
        if (setupIntent.metadata?.userId) {
          const userId = parseInt(setupIntent.metadata.userId);
          const customer = setupIntent.customer as string;
          await updateUserStripeCustomerId(userId, customer);
        }
        break;

      case "customer.created":
      case "setup_intent.created":
      case "payment_method.attached":
        // これらのイベントは正常なフローの一部なので、特に処理は必要ありません
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
