import { cartRepository } from "../repositories/cart.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { redirect } from "next/navigation";

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

    await paymentRepository.createCheckoutSession({
      userId,
      cart,
      cartItems,
    });
  }

  async accessCustomerPortal(customerId: string): Promise<void> {
    await paymentRepository.createCustomerPortalSession(customerId);
  }
}

export const paymentService = new PaymentService();
