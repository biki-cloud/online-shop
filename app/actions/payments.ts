"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { paymentService } from "@/lib/services/payment.service";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  await paymentService.processCheckout(session.user.id);
}

export async function customerPortalAction() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  await paymentService.accessCustomerPortal(session.user.id.toString());
}
