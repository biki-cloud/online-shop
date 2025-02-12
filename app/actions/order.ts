"use server";

import { orderRepository } from "@/lib/repositories/order.repository";
import { Order, OrderItem } from "@/lib/db/schema";

export async function getOrders(): Promise<Order[]> {
  return await orderRepository.findAll();
}

export async function getOrderById(id: number): Promise<Order | null> {
  return await orderRepository.findById(id);
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  return await orderRepository.findByUserId(userId);
}

export async function createOrder(data: {
  userId: number;
  totalAmount: string;
  currency: string;
  shippingAddress?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}): Promise<Order> {
  return await orderRepository.create(data);
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
  return await orderRepository.createOrderItems(orderId, items);
}

export async function updateOrder(
  id: number,
  data: Partial<{
    status: string;
    stripeSessionId: string;
    stripePaymentIntentId: string;
  }>
): Promise<Order | null> {
  return await orderRepository.update(id, data);
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
  return await orderRepository.getOrderItems(orderId);
}
