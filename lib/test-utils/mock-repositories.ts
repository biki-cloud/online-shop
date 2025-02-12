import { Cart, CartItem, Product } from "@/lib/db/schema";
import { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";

export class MockCartRepository implements ICartRepository {
  private carts: Cart[] = [];
  private cartItems: (CartItem & { product: Product | null })[] = [];

  async findById(id: number): Promise<Cart | null> {
    return this.carts.find((cart) => cart.id === id) || null;
  }

  async findAll(): Promise<Cart[]> {
    return this.carts;
  }

  async create(data: Partial<Cart>): Promise<Cart> {
    const cart = {
      id: this.carts.length + 1,
      userId: data.userId!,
      status: data.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.carts.push(cart);
    return cart;
  }

  async update(id: number, data: Partial<Cart>): Promise<Cart | null> {
    const index = this.carts.findIndex((cart) => cart.id === id);
    if (index === -1) return null;

    this.carts[index] = {
      ...this.carts[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.carts[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.carts.findIndex((cart) => cart.id === id);
    if (index === -1) return false;

    this.carts.splice(index, 1);
    return true;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    return (
      this.carts.find(
        (cart) => cart.userId === userId && cart.status === "active"
      ) || null
    );
  }

  async getCartItems(
    cartId: number
  ): Promise<(CartItem & { product: Product | null })[]> {
    return this.cartItems.filter((item) => item.cartId === cartId);
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number = 1
  ): Promise<CartItem> {
    const existingItem = this.cartItems.find(
      (item) => item.cartId === cartId && item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = new Date();
      return existingItem;
    }

    const newItem = {
      id: this.cartItems.length + 1,
      cartId,
      productId,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: null,
    };
    this.cartItems.push(newItem);
    return newItem;
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem | null> {
    const item = this.cartItems.find((item) => item.id === cartItemId);
    if (!item) return null;

    item.quantity = quantity;
    item.updatedAt = new Date();
    return item;
  }

  async removeFromCart(cartItemId: number): Promise<boolean> {
    const index = this.cartItems.findIndex((item) => item.id === cartItemId);
    if (index === -1) return false;

    this.cartItems.splice(index, 1);
    return true;
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.findActiveCartByUserId(userId);
    if (!cart) return;

    cart.status = "completed";
    cart.updatedAt = new Date();
  }
}
