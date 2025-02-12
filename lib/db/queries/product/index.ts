import { eq } from "drizzle-orm";
import { db } from "../../drizzle";
import { products } from "../../schema";
import { Product } from "../../schema";

export async function getProducts() {
  return await db.select().from(products);
}

export async function getProductById(id: number) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createProduct(
  data: Pick<
    Product,
    "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
  >
) {
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
