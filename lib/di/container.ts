import { Database } from "@/lib/db/drizzle";
import { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";
import { IOrderRepository } from "@/lib/repositories/interfaces/order.repository";
import { IPaymentRepository } from "@/lib/repositories/interfaces/payment.repository";
import { IUserRepository } from "@/lib/repositories/interfaces/user.repository";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { PaymentRepository } from "@/lib/repositories/payment.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { ICartService } from "../services/interfaces/cart.service";
import { CartService } from "../services/cart.service";

export interface DIContainer {
  db: Database;
  cartRepository: ICartRepository;
  orderRepository: IOrderRepository;
  paymentRepository: IPaymentRepository;
  userRepository: IUserRepository;
  cartService: ICartService;
}

export const createContainer = (db: Database): DIContainer => {
  const cartRepository = new CartRepository(db);
  const orderRepository = new OrderRepository(db);
  const paymentRepository = new PaymentRepository(db);
  const userRepository = new UserRepository(db);

  return {
    db,
    cartRepository,
    orderRepository,
    paymentRepository,
    userRepository,
    cartService: new CartService(cartRepository),
  };
};
