import { eq } from "drizzle-orm";
import { db } from "../../drizzle";
import { products } from "../../schema";
import { Product } from "../../schema";
import { mockProducts } from "../../../mock/products";
import { USE_MOCK } from "../../../config";

export async function getProducts() {
  if (USE_MOCK) {
    return mockProducts;
  }
  return await db.select().from(products);
}

export async function getProductById(id: number) {
  if (USE_MOCK) {
    return mockProducts.find((product) => product.id === id) ?? null;
  }
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createProduct(
  data: Pick<Product, "name" | "description" | "price" | "stock" | "currency">
) {
  if (USE_MOCK) {
    const newProduct: Product = {
      id: mockProducts.length + 1,
      ...data,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    console.log("newProduct", newProduct);
    mockProducts.push(newProduct);
    console.log("mockProducts", mockProducts);
    return newProduct;
  }

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
