import { Product } from "@/lib/db/schema";
import { IProductRepository } from "../repositories/interfaces/product.repository";
import { IProductService } from "./interfaces/product.service";

export class ProductService implements IProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async findById(id: number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async create(
    data: Pick<
      Product,
      "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
    >
  ): Promise<Product> {
    return await this.productRepository.create(data);
  }

  async update(
    id: number,
    data: Partial<
      Pick<
        Product,
        "name" | "description" | "price" | "stock" | "currency" | "imageUrl"
      >
    >
  ): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error("商品が見つかりません");
    }
    return await this.productRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error("商品が見つかりません");
    }
    return await this.productRepository.delete(id);
  }
}
