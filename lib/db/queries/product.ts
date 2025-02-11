import { db } from "@/lib/db/drizzle";
import { products } from "@/lib/db/schema";
import { Product } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { mockProducts } from "@/lib/mock/products";

const USE_MOCK = process.env.USE_MOCK === "true";

export async function getProducts() {
  if (USE_MOCK) {
    return mockProducts;
  }
  return await db.select().from(products).where(isNull(products.deletedAt));
}

type CreateProductInput = {
  name: string;
  description: string;
  price: string;
  stock: number;
  currency: string;
};

export async function createProduct(data: CreateProductInput) {
  if (USE_MOCK) {
    const newProduct: Product = {
      id: mockProducts.length + 1,
      ...data,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    mockProducts.push(newProduct);
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
