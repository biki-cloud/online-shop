import "reflect-metadata";
import { container } from "tsyringe";
import { Database } from "@/lib/db/drizzle";
import { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";
import { IOrderRepository } from "@/lib/repositories/interfaces/order.repository";
import { IPaymentRepository } from "@/lib/repositories/interfaces/payment.repository";
import { IUserRepository } from "@/lib/repositories/interfaces/user.repository";
import { IProductRepository } from "@/lib/repositories/interfaces/product.repository";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { PaymentRepository } from "@/lib/repositories/payment.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { ICartService } from "../services/interfaces/cart.service";
import { IProductService } from "../services/interfaces/product.service";
import { IPaymentService } from "../services/interfaces/payment.service";
import { IOrderService } from "../services/interfaces/order.service";
import { IUserService } from "../services/interfaces/user.service";
import { CartService } from "../services/cart.service";
import { ProductService } from "../services/product.service";
import { PaymentService } from "../services/payment.service";
import { OrderService } from "../services/order.service";
import { UserService } from "../services/user.service";

export function registerDependencies(db: Database) {
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
}

export function getContainer() {
  return container;
}
