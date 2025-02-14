"use server";

import {
  Order,
  OrderItem,
  CreateOrderInput,
  UpdateOrderInput,
  CreateOrderItemInput,
} from "@/lib/domain/order";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";

export async function getOrders(): Promise<Order[]> {
  const container = createContainer(db);
  const orders = await container.orderService.findAll();
  return orders;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const container = createContainer(db);
  return await container.orderService.findById(id);
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const container = createContainer(db);
  return await container.orderService.findByUserId(userId);
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const container = createContainer(db);
  return await container.orderService.create(data);
}

export async function createOrderItems(
  orderId: number,
  items: Omit<CreateOrderItemInput, "orderId">[]
): Promise<OrderItem[]> {
  const container = createContainer(db);
  const orderItems = await Promise.all(
    items.map((item) =>
      container.orderService.createOrderItem({ ...item, orderId })
    )
  );
  return orderItems;
}

export async function updateOrder(
  id: number,
  data: UpdateOrderInput
): Promise<Order | null> {
  const container = createContainer(db);
  return await container.orderService.update(id, data);
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const container = createContainer(db);
  return await container.orderService.getOrderItems(orderId);
}
