import { Cart, CartItem, Product } from "@/lib/db/schema";
import { IBaseRepository } from "../base.repository";

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
  clearCart(userId: number): Promise<void>;
}
