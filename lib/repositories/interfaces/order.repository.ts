import { Order, OrderItem } from "@/lib/db/schema";

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  findByUserId(userId: number): Promise<Order[]>;
  create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order>;
  createOrderItems(
    orderId: number,
    items: {
      productId: number;
      quantity: number;
      price: string;
      currency: string;
    }[]
  ): Promise<OrderItem[]>;
  update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null>;
  getOrderItems(orderId: number): Promise<
    (OrderItem & {
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      } | null;
    })[]
  >;
}
