"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { cartRepository } from "@/lib/repositories/cart.repository";
import { getSession } from "@/lib/auth/session";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const cart = await cartRepository.findActiveCartByUserId(session.user.id);
  if (!cart) {
    redirect("/cart");
  }

  const cartItems = await cartRepository.getCartItems(cart.id);
  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  await createCheckoutSession({
    userId: session.user.id,
    cart: cart,
    cartItems: cartItems,
  });
}

export async function customerPortalAction() {
  // Note: この機能は現在サポートされていません
  throw new Error("Customer portal is not supported");
}
