import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { carts, cartItems, products } from "@/lib/db/schema";
import type { Cart, CartItem, Product } from "@/lib/db/schema";
import { BaseRepository, IBaseRepository } from "./base.repository";
import { PgColumn } from "drizzle-orm/pg-core";

export interface ICartRepository extends IBaseRepository<Cart> {
  findActiveCartByUserId(userId: number): Promise<Cart | null>;
  getCartItems(
    cartId: number
  ): Promise<(CartItem & { product: Product | null })[]>;
  addToCart(
    cartId: number,
    productId: number,
    quantity?: number
  ): Promise<CartItem>;
  updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null>;
  removeFromCart(cartItemId: number): Promise<boolean>;
}

export class CartRepository
  extends BaseRepository<Cart>
  implements ICartRepository
{
  constructor() {
    super(carts);
  }

  protected get idColumn(): PgColumn<any> {
    return carts.id;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    const result = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);
    return result[0] ?? null;
  }

  async getCartItems(
    cartId: number
  ): Promise<(CartItem & { product: Product | null })[]> {
    return await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      )
      .limit(1);

    if (existingItem.length > 0) {
      const result = await db
        .update(cartItems)
        .set({
          quantity: existingItem[0].quantity + quantity,
          updatedAt: new Date(),
        })
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
        )
        .returning();
      return result[0];
    }

    const result = await db
      .insert(cartItems)
      .values({
        cartId,
        productId,
        quantity,
      })
      .returning();

    return result[0];
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const result = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return result[0] || null;
  }

  async removeFromCart(cartItemId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return result.length > 0;
  }
}
