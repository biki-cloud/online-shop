import { BaseRepository } from "./base.repository";
import type { Cart, CartItem, Order, Product } from "@/lib/db/schema";
import { Database } from "@/lib/db/drizzle";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { calculateOrderAmount } from "@/lib/utils";
import { updateOrder } from "@/app/actions/order";
import { getFullImageUrl } from "@/lib/utils/url";
import { PAYMENT_CONSTANTS, type PaymentStatus } from "@/lib/constants/payment";
import { IPaymentRepository } from "./interfaces/payment.repository";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly db: Database) {}

  async createCheckoutSession(data: {
    userId: number;
    orderId: number;
  }): Promise<string> {
    const order = await this.findById(data.orderId);
    if (!order) {
      throw new PaymentError("注文が見つかりません。");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [...PAYMENT_CONSTANTS.SUPPORTED_PAYMENT_METHODS],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: `注文 #${order.id}`,
            },
            unit_amount: Number(order.totalAmount),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cart`,
      metadata: {
        orderId: data.orderId.toString(),
      },
    });

    if (!session.url) {
      throw new PaymentError("Stripeセッションの作成に失敗しました。");
    }

    return session.url;
  }

  async handlePaymentSuccess(sessionId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new PaymentError("注文IDが見つかりません。");
    }

    await updateOrder(orderId, {
      status: "paid" as PaymentStatus,
      stripePaymentIntentId: session.payment_intent as string,
    });
  }

  async handlePaymentFailure(sessionId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new PaymentError("注文IDが見つかりません。");
    }

    await updateOrder(orderId, {
      status: "failed" as PaymentStatus,
    });
  }

  async getStripePrices() {
    const prices = await stripe.prices.list({
      expand: ["data.product"],
      active: true,
      type: "recurring",
    });

    return prices.data.map((price) => ({
      id: price.id,
      productId:
        typeof price.product === "string" ? price.product : price.product.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      trialPeriodDays: price.recurring?.trial_period_days,
    }));
  }

  async getStripeProducts() {
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPriceId:
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id,
    }));
  }

  // BaseRepositoryの実装
  async findById(id: number): Promise<Order | null> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<Order[]> {
    throw new Error("Method not implemented.");
  }

  async create(data: Partial<Order>): Promise<Order> {
    throw new Error("Method not implemented.");
  }

  async update(id: number, data: Partial<Order>): Promise<Order | null> {
    throw new Error("Method not implemented.");
  }

  async delete(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
