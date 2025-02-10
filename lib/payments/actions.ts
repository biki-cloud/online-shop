"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession } from "./stripe";
import { getCartItems, getCartForUser } from "@/lib/db/queries/cart";
import { getSession } from "@/lib/auth/session";

export async function checkoutAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const cart = await getCartForUser(session.user.id);
  if (!cart) {
    redirect("/cart");
  }

  const cartItems = await getCartItems(cart.id);
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
