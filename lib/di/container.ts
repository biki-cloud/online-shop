import "reflect-metadata";
import { container } from "tsyringe";
import type { Database } from "@/lib/db/drizzle";
import type { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";
import type { IOrderRepository } from "@/lib/repositories/interfaces/order.repository";
import type { IPaymentRepository } from "@/lib/repositories/interfaces/payment.repository";
import type { IUserRepository } from "@/lib/repositories/interfaces/user.repository";
import type { IProductRepository } from "@/lib/repositories/interfaces/product.repository";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { PaymentRepository } from "@/lib/repositories/payment.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import type { ICartService } from "../services/interfaces/cart.service";
import type { IProductService } from "../services/interfaces/product.service";
import type { IPaymentService } from "../services/interfaces/payment.service";
import type { IOrderService } from "../services/interfaces/order.service";
import type { IUserService } from "../services/interfaces/user.service";
import { CartService } from "../services/cart.service";
import { ProductService } from "../services/product.service";
import { PaymentService } from "../services/payment.service";
import { OrderService } from "../services/order.service";
import { UserService } from "../services/user.service";
import { db } from "@/lib/db/drizzle";

let isInitialized = false;

function initializeContainer() {
  if (isInitialized) return;

  // Register Database
  container.registerInstance<Database>("Database", db);

  // Register Repositories
  container.registerSingleton<ICartRepository>(
    "CartRepository",
    CartRepository
  );
  container.registerSingleton<IOrderRepository>(
    "OrderRepository",
    OrderRepository
  );
  container.registerSingleton<IPaymentRepository>(
    "PaymentRepository",
    PaymentRepository
  );
  container.registerSingleton<IUserRepository>(
    "UserRepository",
    UserRepository
  );
  container.registerSingleton<IProductRepository>(
    "ProductRepository",
    ProductRepository
  );

  // Register Services
  container.registerSingleton<ICartService>("CartService", CartService);
  container.registerSingleton<IProductService>(
    "ProductService",
    ProductService
  );
  container.registerSingleton<IPaymentService>(
    "PaymentService",
    PaymentService
  );
  container.registerSingleton<IOrderService>("OrderService", OrderService);
  container.registerSingleton<IUserService>("UserService", UserService);

  isInitialized = true;
}

// 初期化を即時実行
initializeContainer();

export { container };

export function getContainer() {
  return container;
}
