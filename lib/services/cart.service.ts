import { Cart, CartItem } from "@/lib/domain/cart";
import { ICartRepository } from "../repositories/interfaces/cart.repository";
import { ICartService } from "./interfaces/cart.service";

export class CartService implements ICartService {
  constructor(private readonly cartRepository: ICartRepository) {}

  async findActiveCart(userId: number): Promise<Cart | null> {
    return await this.cartRepository.findActiveCartByUserId(userId);
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await this.cartRepository.getCartItems(cartId);
  }

  async addToCart(
    userId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    const cart = await this.findActiveCart(userId);
    if (!cart) {
      const newCart = await this.cartRepository.create({
        userId,
        status: "active",
      });
      return await this.cartRepository.addToCart(
        newCart.id,
        productId,
        quantity
      );
    }
    return await this.cartRepository.addToCart(cart.id, productId, quantity);
  }

  async updateCartItemQuantity(
    userId: number,
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const cart = await this.findActiveCart(userId);
    if (!cart) {
      throw new Error("カートが見つかりません");
    }
    return await this.cartRepository.updateCartItemQuantity(
      cartItemId,
      quantity
    );
  }

  async removeFromCart(userId: number, cartItemId: number): Promise<boolean> {
    const cart = await this.findActiveCart(userId);
    if (!cart) {
      throw new Error("カートが見つかりません");
    }
    return await this.cartRepository.removeFromCart(cartItemId);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }
}
