import { Database } from "@/lib/infrastructure/db/drizzle";
import {
  categories,
  productCategories,
  Category,
} from "@/lib/infrastructure/db/schema";
import { ICategoryRepository } from "@/lib/core/repositories/interfaces/category.repository";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/core/domain/category";
import { and, eq, isNull } from "drizzle-orm";

export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Category[]> {
    return await this.db
      .select()
      .from(categories)
      .where(isNull(categories.deletedAt));
  }

  async findById(id: number): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)));
    return result[0] ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), isNull(categories.deletedAt)));
    return result[0] ?? null;
  }

  async create(data: CreateCategoryInput): Promise<Category> {
    const result = await this.db.insert(categories).values(data).returning();
    return result[0];
  }

  async update(
    id: number,
    data: UpdateCategoryInput
  ): Promise<Category | null> {
    const result = await this.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();
    return result[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .returning();
    return result.length > 0;
  }

  async addProductToCategory(
    productId: number,
    categoryId: number
  ): Promise<void> {
    await this.db.insert(productCategories).values({
      productId,
      categoryId,
    });
  }

  async removeProductFromCategory(
    productId: number,
    categoryId: number
  ): Promise<void> {
    await this.db
      .delete(productCategories)
      .where(
        and(
          eq(productCategories.productId, productId),
          eq(productCategories.categoryId, categoryId)
        )
      );
  }

  async findProductCategories(productId: number): Promise<Category[]> {
    const result = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        deletedAt: categories.deletedAt,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(
        and(
          eq(productCategories.productId, productId),
          isNull(categories.deletedAt)
        )
      );
    return result;
  }
}
