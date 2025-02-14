"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getContainer } from "@/lib/di/container-provider";
import type Stripe from "stripe";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const container = getContainer();
  await container.paymentService.processCheckout(session.user.id);
}

export async function handleStripeWebhook(session: Stripe.Checkout.Session) {
  const container = getContainer();
  if (session.payment_status === "paid") {
    await container.paymentService.handlePaymentSuccess(session);
  } else if (session.payment_status === "unpaid") {
    await container.paymentService.handlePaymentFailure(session);
  }
}

export async function getStripePrices() {
  const container = getContainer();
  return await container.paymentService.getStripePrices();
}

export async function getStripeProducts() {
  const container = getContainer();
  return await container.paymentService.getStripeProducts();
}
