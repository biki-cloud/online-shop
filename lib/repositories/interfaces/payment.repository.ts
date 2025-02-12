import { IBaseRepository } from "../base.repository";
import type { Order } from "@/lib/db/schema";

export interface IPaymentRepository extends IBaseRepository<Order> {
  createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<string>;
  handlePaymentSuccess(sessionId: string): Promise<void>;
  handlePaymentFailure(sessionId: string): Promise<void>;
  getStripePrices(): Promise<any[]>;
  getStripeProducts(): Promise<any[]>;
}
