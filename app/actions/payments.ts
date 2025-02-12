"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { paymentService } from "@/lib/services/payment.service";
import type Stripe from "stripe";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  await paymentService.processCheckout(session.user.id);
}

export async function handleStripeWebhook(session: Stripe.Checkout.Session) {
  if (session.payment_status === "paid") {
    await paymentService.handlePaymentSuccess(session);
  } else if (session.payment_status === "unpaid") {
    await paymentService.handlePaymentFailure(session);
  }
}

export async function getStripePrices() {
  return await paymentService.getStripePrices();
}

export async function getStripeProducts() {
  return await paymentService.getStripeProducts();
}
