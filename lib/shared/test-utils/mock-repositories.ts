import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
} from "@/lib/infrastructure/db/schema";
import type { CreateCartInput } from "@/lib/core/domain/cart";
import type { CreateOrderInput } from "@/lib/core/domain/order";

export class MockCartRepository {
  async create(input: CreateCartInput): Promise<Cart> {
    return { id: 1, ...input } as Cart;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    return { id: 1, userId, status: "active" } as Cart;
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem> {
    return { id: 1, cartId, productId, quantity } as CartItem;
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem> {
    return { id: cartItemId, quantity } as CartItem;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    return;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return [];
  }

  async clearCart(userId: number): Promise<void> {
    return;
  }
}

export class MockOrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    return { id: 1, ...input } as Order;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return [{ id: 1, userId }] as Order[];
  }

  async createOrderItems(
    orderId: number,
    items: Omit<OrderItem, "id" | "orderId">[]
  ): Promise<OrderItem[]> {
    return items.map((item, index) => ({
      id: index + 1,
      orderId,
      ...item,
    })) as OrderItem[];
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return [];
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    return { id, ...data } as Order;
  }
}

export class MockPaymentRepository {
  async createCheckoutSession(data: any): Promise<any> {
    return { id: "session_id" };
  }

  async handlePaymentSuccess(sessionId: string): Promise<void> {
    return;
  }

  async handlePaymentFailure(sessionId: string): Promise<void> {
    return;
  }

  async getStripePrices(): Promise<any[]> {
    return [];
  }

  async getStripeProducts(): Promise<any[]> {
    return [];
  }

  async create(data: any): Promise<any> {
    return { id: 1, ...data };
  }

  async update(id: number, data: any): Promise<any> {
    return { id, ...data };
  }
}
