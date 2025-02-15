import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
} from "@/lib/infrastructure/db/schema";
import type { CreateCartInput } from "@/lib/core/domain/cart";
import type { CreateOrderInput } from "@/lib/core/domain/order";

interface Product {
  id: number;
  price: string;
  currency: string;
}

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export class MockCartRepository {
  async create(input: CreateCartInput): Promise<Cart> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...input,
    } as Cart;
  }

  async findActiveCartByUserId(userId: number): Promise<Cart | null> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      userId,
      status: "active",
    } as Cart;
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number
  ): Promise<CartItem> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      cartId,
      productId,
      quantity,
    } as CartItem;
  }

  async updateCartItemQuantity(
    cartItemId: number,
    quantity: number
  ): Promise<CartItem> {
    const now = new Date();
    return {
      id: cartItemId,
      createdAt: now,
      updatedAt: now,
      cartId: 1,
      productId: 1,
      quantity,
    } as CartItem;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    return;
  }

  async getCartItems(cartId: number): Promise<CartItemWithProduct[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        cartId,
        productId: 1,
        quantity: 1,
        product: {
          id: 1,
          price: "1000",
          currency: "jpy",
        },
      },
    ] as CartItemWithProduct[];
  }

  async clearCart(userId: number): Promise<void> {
    return;
  }
}

export class MockOrderRepository {
  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      ...input,
    } as Order;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        userId,
        status: "pending",
        totalAmount: "1000",
        currency: "jpy",
        stripeSessionId: null,
        stripePaymentIntentId: null,
        shippingAddress: null,
      },
    ];
  }

  async findById(orderId: number): Promise<Order | null> {
    const now = new Date();
    return {
      id: orderId,
      createdAt: now,
      updatedAt: now,
      userId: 1,
      status: "pending",
      totalAmount: "1000",
      currency: "jpy",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      shippingAddress: null,
    };
  }

  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    const now = new Date();
    return {
      id: 1,
      createdAt: now,
      updatedAt: now,
      userId: 1,
      status: "pending",
      totalAmount: "1000",
      currency: "jpy",
      stripeSessionId: sessionId,
      stripePaymentIntentId: null,
      shippingAddress: null,
    };
  }

  async createOrderItems(
    orderId: number,
    items: Array<{
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }>
  ): Promise<OrderItem[]> {
    const now = new Date();
    return items.map((item, index) => ({
      id: index + 1,
      createdAt: now,
      updatedAt: now,
      orderId,
      ...item,
    })) as OrderItem[];
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const now = new Date();
    return [
      {
        id: 1,
        createdAt: now,
        updatedAt: now,
        orderId,
        productId: 1,
        quantity: 1,
        price: "1000",
        currency: "jpy",
      },
    ];
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const now = new Date();
    return {
      id,
      createdAt: now,
      updatedAt: now,
      userId: 1,
      status: data.status || "pending",
      totalAmount: "1000",
      currency: "jpy",
      stripeSessionId: data.stripeSessionId || null,
      stripePaymentIntentId: data.stripePaymentIntentId || null,
      shippingAddress: null,
      ...data,
    };
  }
}

export class MockPaymentRepository {
  async createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<string | undefined> {
    return "session_123";
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
