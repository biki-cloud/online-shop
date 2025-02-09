import type { Stripe } from "stripe";

export type PaymentMethod = Omit<Stripe.PaymentMethod, "customer"> & {
  customer: string;
};
