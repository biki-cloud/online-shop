import { productRepository } from "@/lib/repositories/product.repository";
import { Product } from "@/lib/db/schema";

export async function getProducts(): Promise<Product[]> {
  return await productRepository.findAll();
}

export async function getProductById(id: number): Promise<Product | null> {
  return await productRepository.findById(id);
}

export async function createProduct(
  data: Pick<
    Product,
    "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
  >
): Promise<Product> {
  return await productRepository.create(data);
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
  return await productRepository.update(id, data);
}

export async function deleteProduct(id: number): Promise<boolean> {
  return await productRepository.delete(id);
}
