import { Product } from "@/lib/db/schema";

export interface IProductService {
  findById(id: number): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(
    data: Pick<
      Product,
      "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
    >
  ): Promise<Product>;
  update(
    id: number,
    data: Partial<
      Pick<
        Product,
        "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
      >
    >
  ): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
