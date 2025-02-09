"use server";

import { redirect } from "next/navigation";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  stripe,
} from "./stripe";
import { withTeam } from "@/lib/auth/middleware";
import type { PaymentMethod } from "./types";

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get("priceId") as string;
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});

export async function getPaymentMethods(
  customerId: string
): Promise<PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
}

export async function deletePaymentMethod(
  paymentMethodId: string
): Promise<void> {
  try {
    await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
}
