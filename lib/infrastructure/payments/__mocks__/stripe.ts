export const stripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: "session_123",
        url: "https://checkout.stripe.com/session",
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: "session_123",
        payment_status: "paid",
        payment_intent: "pi_123",
      }),
    },
  },
  products: {
    create: jest.fn().mockResolvedValue({
      id: "prod_123",
    }),
    update: jest.fn().mockResolvedValue({
      id: "prod_123",
    }),
  },
  prices: {
    create: jest.fn().mockResolvedValue({
      id: "price_123",
    }),
    update: jest.fn().mockResolvedValue({
      id: "price_123",
    }),
  },
};
