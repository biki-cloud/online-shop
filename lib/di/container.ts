import { Database } from "@/lib/db/drizzle";
import { ICartRepository } from "@/lib/repositories/interfaces/cart.repository";
import { IOrderRepository } from "@/lib/repositories/interfaces/order.repository";
import { IPaymentRepository } from "@/lib/repositories/interfaces/payment.repository";
import { IUserRepository } from "@/lib/repositories/interfaces/user.repository";
import { CartRepository } from "@/lib/repositories/cart.repository";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { PaymentRepository } from "@/lib/repositories/payment.repository";
import { UserRepository } from "@/lib/repositories/user.repository";

export interface DIContainer {
  db: Database;
  cartRepository: ICartRepository;
  orderRepository: IOrderRepository;
  paymentRepository: IPaymentRepository;
  userRepository: IUserRepository;
}

export const createContainer = (db: Database): DIContainer => {
  return {
    db,
    cartRepository: new CartRepository(db),
    orderRepository: new OrderRepository(db),
    paymentRepository: new PaymentRepository(db),
    userRepository: new UserRepository(db),
  };
};
