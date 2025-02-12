import { cartRepository } from "../repositories/cart.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { redirect } from "next/navigation";
import {
  createOrder,
  createOrderItems,
  updateOrder,
} from "@/app/actions/order";
import type Stripe from "stripe";

export class PaymentService {
  async processCheckout(userId: number): Promise<void> {
    const cart = await cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      redirect("/cart");
    }

    const cartItems = await cartRepository.getCartItems(cart.id);
    if (!cartItems || cartItems.length === 0) {
      redirect("/cart");
    }

    // 注文の作成
    const order = await createOrder({
      userId,
      totalAmount: cartItems
        .reduce(
          (sum, item) => sum + Number(item.product!.price) * item.quantity,
          0
        )
        .toString(),
      currency: "JPY",
    });

    // 注文アイテムの作成
    await createOrderItems(
      order.id,
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
        currency: item.product!.currency,
      }))
    );

    // Stripeセッションの作成とリダイレクト
    const checkoutUrl = await paymentRepository.createCheckoutSession({
      userId,
      cart,
      cartItems,
      orderId: order.id,
    });

    // 注文ステータスの更新
    await updateOrder(order.id, {
      status: "pending",
    });

    redirect(checkoutUrl);
  }

  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    await paymentRepository.handlePaymentSuccess(session);
  }

  async handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    await paymentRepository.handlePaymentFailure(session);
  }

  async getStripePrices() {
    return await paymentRepository.getStripePrices();
  }

  async getStripeProducts() {
    return await paymentRepository.getStripeProducts();
  }
}

export const paymentService = new PaymentService();
