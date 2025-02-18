import { injectable, inject } from "tsyringe";
import { ICategoryRepository } from "@/lib/core/repositories/interfaces/category.repository";
import { Category } from "@/lib/infrastructure/db/schema";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/core/domain/category";
import { ICategoryService } from "./interfaces/category.service";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject("CategoryRepository")
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.findAll();
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return await this.categoryRepository.findById(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await this.categoryRepository.findBySlug(slug);
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    const existingCategory = await this.categoryRepository.findBySlug(
      data.slug
    );
    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }
    return await this.categoryRepository.create(data);
  }

  async updateCategory(
    id: number,
    data: UpdateCategoryInput
  ): Promise<Category | null> {
    if (data.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(
        data.slug
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new Error("Category with this slug already exists");
      }
    }
    return await this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return await this.categoryRepository.delete(id);
  }

  async addProductToCategory(
    productId: number,
    categoryId: number
  ): Promise<void> {
    await this.categoryRepository.addProductToCategory(productId, categoryId);
  }

  async removeProductFromCategory(
    productId: number,
    categoryId: number
  ): Promise<void> {
    await this.categoryRepository.removeProductFromCategory(
      productId,
      categoryId
    );
  }

  async getProductCategories(productId: number): Promise<Category[]> {
    return await this.categoryRepository.findProductCategories(productId);
  }
}
