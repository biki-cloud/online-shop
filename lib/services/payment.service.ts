import { redirect } from "next/navigation";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type Stripe from "stripe";
import { stripe } from "@/lib/payments/stripe";
import type { IPaymentRepository } from "../repositories/interfaces/payment.repository";
import type { ICartRepository } from "../repositories/interfaces/cart.repository";
import type { IOrderRepository } from "../repositories/interfaces/order.repository";
import type { Cart, CartItem } from "@/lib/domain/cart";
import { calculateOrderAmount } from "../utils";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getFullImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl) return undefined;

  // 既に完全なURLの場合はそのまま返す
  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }

  // 相対パスの場合は、BASE_URLと組み合わせて完全なURLを生成
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return undefined;

  const fullUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  return isValidUrl(fullUrl) ? fullUrl : undefined;
}

@injectable()
export class PaymentService {
  constructor(
    @inject("PaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
    @inject("CartRepository")
    private readonly cartRepository: ICartRepository,
    @inject("OrderRepository")
    private readonly orderRepository: IOrderRepository
  ) {}

  async processCheckout(userId: number): Promise<void> {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      redirect("/cart");
    }

    const cartItems = await this.cartRepository.getCartItems(cart.id);
    if (!cartItems || cartItems.length === 0) {
      redirect("/cart");
    }

    await this.createCheckoutSession({
      userId,
      cart,
      cartItems,
    });
  }

  private async createCheckoutSession({
    userId,
    cart,
    cartItems,
  }: {
    userId: number;
    cart: Cart;
    cartItems: CartItem[];
  }): Promise<void> {
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
        const priceWithTax = Math.round(Number(item.product!.price) * 1.1);
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

    const order = await this.orderRepository.create({
      userId,
      totalAmount: total.toString(),
      currency: "JPY",
      status: "pending",
    });

    await this.orderRepository.createOrderItems(
      order.id,
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
        currency: item.product!.currency,
      }))
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cart`,
      metadata: {
        orderId: order.id.toString(),
      },
    });

    await this.orderRepository.update(order.id, {
      status: "pending",
      stripeSessionId: session.id,
    });

    redirect(session.url!);
  }

  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new Error("注文IDが見つかりません。");
    }

    await this.orderRepository.update(orderId, {
      status: "paid",
      stripePaymentIntentId: session.payment_intent as string,
    });
  }

  async handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = Number(session.metadata?.orderId);
    if (!orderId) {
      throw new Error("注文IDが見つかりません。");
    }

    await this.orderRepository.update(orderId, {
      status: "failed",
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
}
