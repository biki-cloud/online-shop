"use server";

import { revalidatePath } from "next/cache";
import { getContainer } from "@/lib/di/container-provider";
import { Product } from "@/lib/db/schema";

export async function getProducts(): Promise<Product[]> {
  const container = getContainer();
  return await container.productService.findAll();
}

export async function getProduct(id: number): Promise<Product | null> {
  const container = getContainer();
  return await container.productService.findById(id);
}

export async function createProduct(
  data: Pick<
    Product,
    "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
  >
): Promise<Product> {
  const container = getContainer();
  const product = await container.productService.create(data);
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: number,
  data: Partial<
    Pick<
      Product,
      "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
    >
  >
): Promise<Product | null> {
  const container = getContainer();
  const product = await container.productService.update(id, data);
  revalidatePath("/admin/products");
  revalidatePath(`/products/${id}`);
  return product;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const container = getContainer();
  const result = await container.productService.delete(id);
  revalidatePath("/admin/products");
  return result;
}
