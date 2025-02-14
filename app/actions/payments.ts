"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";
import type Stripe from "stripe";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const container = createContainer(db);
  await container.paymentService.processCheckout(session.user.id);
}

export async function handleStripeWebhook(session: Stripe.Checkout.Session) {
  const container = createContainer(db);
  if (session.payment_status === "paid") {
    await container.paymentService.handlePaymentSuccess(session);
  } else if (session.payment_status === "unpaid") {
    await container.paymentService.handlePaymentFailure(session);
  }
}

export async function getStripePrices() {
  const container = createContainer(db);
  return await container.paymentService.getStripePrices();
}

export async function getStripeProducts() {
  const container = createContainer(db);
  return await container.paymentService.getStripeProducts();
}
