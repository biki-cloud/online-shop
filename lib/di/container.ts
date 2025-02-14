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
import { CartService } from "../services/cart.service";
import { ProductService } from "../services/product.service";
import { PaymentService } from "../services/payment.service";

export interface DIContainer {
  db: Database;
  cartRepository: ICartRepository;
  orderRepository: IOrderRepository;
  paymentRepository: IPaymentRepository;
  userRepository: IUserRepository;
  productRepository: IProductRepository;
  cartService: ICartService;
  productService: IProductService;
  paymentService: IPaymentService;
}

export const createContainer = (db: Database): DIContainer => {
  const cartRepository = new CartRepository(db);
  const orderRepository = new OrderRepository(db);
  const paymentRepository = new PaymentRepository(db);
  const userRepository = new UserRepository(db);
  const productRepository = new ProductRepository(db);

  return {
    db,
    cartRepository,
    orderRepository,
    paymentRepository,
    userRepository,
    productRepository,
    cartService: new CartService(cartRepository),
    productService: new ProductService(productRepository),
    paymentService: new PaymentService(
      paymentRepository,
      cartRepository,
      orderRepository
    ),
  };
};
