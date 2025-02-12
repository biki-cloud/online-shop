import { Cart, CartItem, Order, OrderItem, Product } from "@/lib/db/schema";
import { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";
import { IOrderRepository } from "@/lib/repositories/interfaces/order.repository";
import { IPaymentRepository } from "@/lib/repositories/interfaces/payment.repository";

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

export class MockOrderRepository implements IOrderRepository {
  private orders: Order[] = [];
  private orderItems: (OrderItem & {
    product: {
      id: number;
      name: string;
      imageUrl: string | null;
    } | null;
  })[] = [];

  async findAll(): Promise<Order[]> {
    return this.orders;
  }

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orders.filter((order) => order.userId === userId);
  }

  async create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    status?: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const order = {
      id: this.orders.length + 1,
      userId: data.userId,
      totalAmount: data.totalAmount,
      currency: data.currency,
      status: data.status || "pending",
      shippingAddress: data.shippingAddress || null,
      stripeSessionId: data.stripeSessionId || null,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  async createOrderItems(
    orderId: number,
    items: {
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }[]
  ): Promise<OrderItem[]> {
    const newItems = items.map((item, index) => ({
      id: this.orderItems.length + index + 1,
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: null,
    }));
    this.orderItems.push(...newItems);
    return newItems;
  }

  async update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null> {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.orders[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return false;

    this.orders.splice(index, 1);
    return true;
  }

  async getOrderItems(orderId: number): Promise<
    (OrderItem & {
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      } | null;
    })[]
  > {
    return this.orderItems.filter((item) => item.orderId === orderId);
  }
}

export class MockPaymentRepository implements IPaymentRepository {
  private orders: Order[] = [];

  async findAll(): Promise<Order[]> {
    return this.orders;
  }

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((order) => order.id === id) || null;
  }

  async create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    status?: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const order = {
      id: this.orders.length + 1,
      userId: data.userId,
      totalAmount: data.totalAmount,
      currency: data.currency,
      status: data.status || "pending",
      shippingAddress: data.shippingAddress || null,
      stripeSessionId: data.stripeSessionId || null,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  async update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null> {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.orders[index];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.orders.findIndex((order) => order.id === id);
    if (index === -1) return false;

    this.orders.splice(index, 1);
    return true;
  }

  async createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<string> {
    return `mock_session_${data.orderId}`;
  }

  async handlePaymentSuccess(sessionId: string): Promise<void> {
    // モックの実装では何もしない
  }

  async handlePaymentFailure(sessionId: string): Promise<void> {
    // モックの実装では何もしない
  }

  async getStripePrices(): Promise<any[]> {
    return [];
  }

  async getStripeProducts(): Promise<any[]> {
    return [];
  }
}
