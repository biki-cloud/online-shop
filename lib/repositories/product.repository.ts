import { eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/db/drizzle";
import { products } from "../db/schema";
import type { IProductRepository } from "./interfaces/product.repository";
import { BaseRepository } from "./base.repository";
import { PgColumn } from "drizzle-orm/pg-core";
import type { Product, CreateProductInput } from "@/lib/domain/product";

@injectable()
export class ProductRepository
  extends BaseRepository<Product, CreateProductInput>
  implements IProductRepository
{
  constructor(
    @inject("Database")
    protected readonly db: Database
  ) {
    super(db, products);
  }

  protected get idColumn(): PgColumn<any> {
    return products.id;
  }

  async findAll(): Promise<Product[]> {
    return await this.db.select().from(products);
  }

  async findById(id: number): Promise<Product | null> {
    const result = await this.db
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
    const [newProduct] = await this.db
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
    const [updatedProduct] = await this.db
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
    const [deletedProduct] = await this.db
      .update(products)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return !!deletedProduct;
  }
}
