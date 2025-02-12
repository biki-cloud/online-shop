"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/actions/user";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";

export async function addToCart(productId: number, quantity: number = 1) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const container = createContainer(db);
  let cart = await container.cartRepository.findActiveCartByUserId(user.id);
  if (!cart) {
    cart = await container.cartRepository.create({
      userId: user.id,
      status: "active",
    });
  }

  await container.cartRepository.addToCart(cart.id, productId, quantity);
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

  const container = createContainer(db);
  await container.cartRepository.updateCartItemQuantity(cartItemId, quantity);
  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: number) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const container = createContainer(db);
  await container.cartRepository.removeFromCart(cartItemId);
  revalidatePath("/cart");
}
