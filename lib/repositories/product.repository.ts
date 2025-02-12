import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { Product, products } from "../db/schema";
import { IProductRepository } from "./interfaces/product.repository";

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async findById(id: number): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async create(
    data: Pick<
      Product,
      "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
    >
  ): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newProduct;
  }

  async update(
    id: number,
    data: Partial<
      Pick<
        Product,
        "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
      >
    >
  ): Promise<Product | null> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return updatedProduct ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const [deletedProduct] = await db
      .update(products)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return !!deletedProduct;
  }
}

// シングルトンインスタンスをエクスポート
export const productRepository = new ProductRepository();
