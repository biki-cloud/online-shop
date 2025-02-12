"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/user";
import { CartRepository } from "@/lib/repositories/cart.repository";

const cartRepository = new CartRepository();

export async function addToCart(productId: number, quantity: number = 1) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  let cart = await cartRepository.findActiveCartByUserId(user.id);
  if (!cart) {
    cart = await cartRepository.create({
      userId: user.id,
      status: "active",
    });
  }

  await cartRepository.addToCart(cart.id, productId, quantity);
  revalidatePath("/cart");
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  await cartRepository.updateCartItemQuantity(cartItemId, quantity);
  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  await cartRepository.removeFromCart(cartItemId);
  revalidatePath("/cart");
}
