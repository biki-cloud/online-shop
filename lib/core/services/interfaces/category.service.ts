import { Category } from "@/lib/infrastructure/db/schema";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/core/domain/category";

export interface ICategoryService {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(data: CreateCategoryInput): Promise<Category>;
  updateCategory(
    id: number,
    data: UpdateCategoryInput
  ): Promise<Category | null>;
  deleteCategory(id: number): Promise<boolean>;
  addProductToCategory(productId: number, categoryId: number): Promise<void>;
  removeProductFromCategory(
    productId: number,
    categoryId: number
  ): Promise<void>;
  getProductCategories(productId: number): Promise<Category[]>;
}
