import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/core/domain/category";
import { Category } from "@/lib/infrastructure/db/schema";
import { getContainer } from "@/lib/di/container";
import { ICategoryService } from "@/lib/core/services/interfaces/category.service";

function getCategoryService(): ICategoryService {
  const container = getContainer();
  return container.resolve<ICategoryService>("CategoryService");
}

export async function getCategories(): Promise<Category[]> {
  const categoryService = getCategoryService();
  return await categoryService.getAllCategories();
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const categoryService = getCategoryService();
  return await categoryService.getCategoryById(id);
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const categoryService = getCategoryService();
  return await categoryService.getCategoryBySlug(slug);
}

export async function createCategory(
  data: CreateCategoryInput
): Promise<Category> {
  const categoryService = getCategoryService();
  return await categoryService.createCategory(data);
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryInput
): Promise<Category | null> {
  const categoryService = getCategoryService();
  return await categoryService.updateCategory(id, data);
}

export async function deleteCategory(id: number): Promise<boolean> {
  const categoryService = getCategoryService();
  return await categoryService.deleteCategory(id);
}

export async function addProductToCategory(
  productId: number,
  categoryId: number
): Promise<void> {
  const categoryService = getCategoryService();
  await categoryService.addProductToCategory(productId, categoryId);
}

export async function removeProductFromCategory(
  productId: number,
  categoryId: number
): Promise<void> {
  const categoryService = getCategoryService();
  await categoryService.removeProductFromCategory(productId, categoryId);
}

export async function getProductCategories(
  productId: number
): Promise<Category[]> {
  const categoryService = getCategoryService();
  return await categoryService.getProductCategories(productId);
}
