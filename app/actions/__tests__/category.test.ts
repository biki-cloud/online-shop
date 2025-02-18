import { describe, expect, it, beforeEach } from "@jest/globals";
import { db } from "@/lib/infrastructure/db/drizzle";
import { categories, productCategories } from "@/lib/infrastructure/db/schema";
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  addProductToCategory,
  removeProductFromCategory,
  getProductCategories,
} from "../category";

describe("Category Actions", () => {
  beforeEach(async () => {
    await db.delete(productCategories);
    await db.delete(categories);
  });

  it("should create a category", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
      description: "Test Description",
    };

    const category = await createCategory(categoryData);

    expect(category).toMatchObject({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
    });
  });

  it("should not create a category with duplicate slug", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
      description: "Test Description",
    };

    await createCategory(categoryData);

    await expect(createCategory(categoryData)).rejects.toThrow(
      "Category with this slug already exists"
    );
  });

  it("should get all categories", async () => {
    const categoryData1 = {
      name: "Test Category 1",
      slug: "test-category-1",
    };
    const categoryData2 = {
      name: "Test Category 2",
      slug: "test-category-2",
    };

    await createCategory(categoryData1);
    await createCategory(categoryData2);

    const categories = await getCategories();
    expect(categories).toHaveLength(2);
  });

  it("should get category by id", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const createdCategory = await createCategory(categoryData);
    const category = await getCategoryById(createdCategory.id);

    expect(category).toMatchObject(categoryData);
  });

  it("should get category by slug", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    await createCategory(categoryData);
    const category = await getCategoryBySlug(categoryData.slug);

    expect(category).toMatchObject(categoryData);
  });

  it("should update category", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const createdCategory = await createCategory(categoryData);
    const updatedData = {
      name: "Updated Category",
    };

    const updatedCategory = await updateCategory(
      createdCategory.id,
      updatedData
    );

    expect(updatedCategory).toMatchObject({
      ...categoryData,
      ...updatedData,
    });
  });

  it("should delete category", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const createdCategory = await createCategory(categoryData);
    const result = await deleteCategory(createdCategory.id);

    expect(result).toBe(true);

    const category = await getCategoryById(createdCategory.id);
    expect(category).toBeNull();
  });

  it("should add product to category", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const createdCategory = await createCategory(categoryData);
    const productId = 1; // Assuming product exists

    await addProductToCategory(productId, createdCategory.id);
    const categories = await getProductCategories(productId);

    expect(categories).toHaveLength(1);
    expect(categories[0]).toMatchObject(categoryData);
  });

  it("should remove product from category", async () => {
    const categoryData = {
      name: "Test Category",
      slug: "test-category",
    };

    const createdCategory = await createCategory(categoryData);
    const productId = 1; // Assuming product exists

    await addProductToCategory(productId, createdCategory.id);
    await removeProductFromCategory(productId, createdCategory.id);
    const categories = await getProductCategories(productId);

    expect(categories).toHaveLength(0);
  });
});
