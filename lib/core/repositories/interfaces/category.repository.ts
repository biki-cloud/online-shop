import { Category } from "@/lib/infrastructure/db/schema";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/core/domain/category";

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: number, data: UpdateCategoryInput): Promise<Category | null>;
  delete(id: number): Promise<boolean>;
  addProductToCategory(productId: number, categoryId: number): Promise<void>;
  removeProductFromCategory(
    productId: number,
    categoryId: number
  ): Promise<void>;
  findProductCategories(productId: number): Promise<Category[]>;
}
