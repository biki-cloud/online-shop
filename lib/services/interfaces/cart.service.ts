import { Cart, CartItem, Product } from "@/lib/db/schema";

export interface ICartService {
  findActiveCart(userId: number): Promise<Cart | null>;
  getCartItems(
    cartId: number
  ): Promise<(CartItem & { product: Product | null })[]>;
  addToCart(
    userId: number,
    productId: number,
    quantity?: number
  ): Promise<CartItem>;
  updateCartItemQuantity(
    userId: number,
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null>;
  removeFromCart(userId: number, cartItemId: number): Promise<boolean>;
  clearCart(userId: number): Promise<void>;
}
