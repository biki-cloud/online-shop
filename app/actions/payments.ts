"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { PaymentService } from "@/lib/services/payment.service";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";
import type Stripe from "stripe";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const container = createContainer(db);
  const paymentService = new PaymentService(
    container.paymentRepository,
    container.cartRepository
  );
  await paymentService.processCheckout(session.user.id);
}

export async function handleStripeWebhook(session: Stripe.Checkout.Session) {
  const container = createContainer(db);
  const paymentService = new PaymentService(
    container.paymentRepository,
    container.cartRepository
  );

  if (session.payment_status === "paid") {
    await paymentService.handlePaymentSuccess(session);
  } else if (session.payment_status === "unpaid") {
    await paymentService.handlePaymentFailure(session);
  }
}

export async function getStripePrices() {
  const container = createContainer(db);
  const paymentService = new PaymentService(
    container.paymentRepository,
    container.cartRepository
  );
  return await paymentService.getStripePrices();
}

export async function getStripeProducts() {
  const container = createContainer(db);
  const paymentService = new PaymentService(
    container.paymentRepository,
    container.cartRepository
  );
  return await paymentService.getStripeProducts();
}
