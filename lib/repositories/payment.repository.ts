import { BaseRepository, IBaseRepository } from "./base.repository";
import type { Cart, CartItem, Product } from "@/lib/db/schema";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { calculateOrderAmount } from "@/lib/utils";
import { updateOrder } from "@/app/actions/order";
import { getFullImageUrl } from "@/lib/utils/url";
import { PAYMENT_CONSTANTS, type PaymentStatus } from "@/lib/constants/payment";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
});

class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

export interface IPaymentRepository
  extends IBaseRepository<Stripe.Checkout.Session> {
  createCheckoutSession(params: {
    userId: number;
    cart: Cart;
    cartItems: (CartItem & { product: Product | null })[];
    orderId: number;
  }): Promise<string>;
  handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void>;
  handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void>;
  getStripePrices(): Promise<
    Array<{
      id: string;
      productId: string;
      unitAmount: number | null;
      currency: string;
      interval?: string;
      trialPeriodDays?: number | null;
    }>
  >;
  getStripeProducts(): Promise<
    Array<{
      id: string;
      name: string;
      description: string | null;
      defaultPriceId?: string;
    }>
  >;
}

export class PaymentRepository implements IPaymentRepository {
  async createCheckoutSession(params: {
    userId: number;
    cart: Cart;
    cartItems: (CartItem & { product: Product | null })[];
    orderId: number;
  }): Promise<string> {
    const { userId, cart, cartItems, orderId } = params;

    if (!cartItems.length) {
      redirect("/cart");
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product!.price) * item.quantity,
      0
    );

    const { total } = calculateOrderAmount(subtotal);

    const lineItems = cartItems
      .filter((item) => item.product !== null)
      .map((item) => {
        const priceWithTax = Math.round(
          Number(item.product!.price) * PAYMENT_CONSTANTS.TAX_RATE
        );
        const fullImageUrl = getFullImageUrl(item.product!.imageUrl);

        return {
          price_data: {
            currency: item.product!.currency.toLowerCase(),
            product_data: {
              name: item.product!.name,
              description: item.product!.description || undefined,
              images: fullImageUrl ? [fullImageUrl] : undefined,
            },
            unit_amount: priceWithTax,
          },
          quantity: item.quantity,
        };
      });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: PAYMENT_CONSTANTS.SUPPORTED_PAYMENT_METHODS,
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cart`,
      metadata: {
        orderId: orderId.toString(),
      },
    });

    if (!session.url) {
      throw new PaymentError("Stripeセッションの作成に失敗しました。");
    }

    return session.url;
  }

  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new PaymentError("注文IDが見つかりません。");
    }

    await updateOrder(orderId, {
      status: "paid" as PaymentStatus,
      stripePaymentIntentId: session.payment_intent as string,
    });
  }

  async handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
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

  // BaseRepositoryの実装（必要に応じて）
  async findById(id: number): Promise<Stripe.Checkout.Session | null> {
    throw new Error("Method not implemented.");
  }

  async findAll(): Promise<Stripe.Checkout.Session[]> {
    throw new Error("Method not implemented.");
  }

  async create(
    data: Partial<Stripe.Checkout.Session>
  ): Promise<Stripe.Checkout.Session> {
    throw new Error("Method not implemented.");
  }

  async update(
    id: number,
    data: Partial<Stripe.Checkout.Session>
  ): Promise<Stripe.Checkout.Session | null> {
    throw new Error("Method not implemented.");
  }

  async delete(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

export const paymentRepository = new PaymentRepository();
