"use server";

import { Order, OrderItem } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";

export async function getOrders(): Promise<Order[]> {
  const container = createContainer(db);
  return await container.orderRepository.findAll();
}

export async function getOrderById(id: number): Promise<Order | null> {
  const container = createContainer(db);
  return await container.orderRepository.findById(id);
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const container = createContainer(db);
  return await container.orderRepository.findByUserId(userId);
}

export async function createOrder(data: {
  userId: number;
  totalAmount: string;
  currency: string;
  shippingAddress?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<Order> {
  const container = createContainer(db);
  return await container.orderRepository.create(data);
}

export async function createOrderItems(
  orderId: number,
  items: {
    productId: number;
    quantity: number;
    price: string;
    currency: string;
  }[]
): Promise<OrderItem[]> {
  const container = createContainer(db);
  return await container.orderRepository.createOrderItems(orderId, items);
}

export async function updateOrder(
  id: number,
  data: Partial<{
    status: string;
    stripeSessionId: string;
    stripePaymentIntentId: string;
  }>
): Promise<Order | null> {
  const container = createContainer(db);
  return await container.orderRepository.update(id, data);
}

export async function getOrderItems(orderId: number): Promise<
  (OrderItem & {
    product: {
      id: number;
      name: string;
      imageUrl: string | null;
    } | null;
  })[]
> {
  const container = createContainer(db);
  return await container.orderRepository.getOrderItems(orderId);
}
