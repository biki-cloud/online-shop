import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { Order, OrderItem, orders, orderItems, products } from "../db/schema";
import { IOrderRepository } from "./interfaces/order.repository";

export class OrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async findById(id: number): Promise<Order | null> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async create(data: {
    userId: number;
    totalAmount: string;
    currency: string;
    shippingAddress?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...data,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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
    const orderItemsToInsert = items.map((item) => ({
      ...item,
      orderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return await db.insert(orderItems).values(orderItemsToInsert).returning();
  }

  async update(
    id: number,
    data: Partial<{
      status: string;
      stripeSessionId: string;
      stripePaymentIntentId: string;
    }>
  ): Promise<Order | null> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return updatedOrder ?? null;
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
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        currency: orderItems.currency,
        createdAt: orderItems.createdAt,
        updatedAt: orderItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          imageUrl: products.imageUrl,
        },
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
  }
}

export const orderRepository = new OrderRepository();
