import { PaymentRepository } from "../payment.repository";
import { MockPaymentRepository } from "@/lib/shared/test-utils/mock-repositories";
import { Order } from "@/lib/infrastructure/db/schema";

describe("PaymentRepository", () => {
  let repository: MockPaymentRepository;

  beforeEach(() => {
    repository = new MockPaymentRepository();
  });

  describe("createCheckoutSession", () => {
    it("チェックアウトセッションを作成できること", async () => {
      const userId = 1;
      const orderId = 1;

      const result = await repository.createCheckoutSession({
        userId,
        orderId,
      });

      expect(result).toBe(`mock_session_${orderId}`);
    });
  });

  describe("handlePaymentSuccess", () => {
    it("支払い成功を処理できること", async () => {
      const sessionId = "session_1";
      await expect(
        repository.handlePaymentSuccess(sessionId)
      ).resolves.not.toThrow();
    });
  });

  describe("handlePaymentFailure", () => {
    it("支払い失敗を処理できること", async () => {
      const sessionId = "session_1";
      await expect(
        repository.handlePaymentFailure(sessionId)
      ).resolves.not.toThrow();
    });
  });

  describe("getStripePrices", () => {
    it("Stripe価格を取得できること", async () => {
      const result = await repository.getStripePrices();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getStripeProducts", () => {
    it("Stripe商品を取得できること", async () => {
      const result = await repository.getStripeProducts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create", () => {
    it("注文を作成できること", async () => {
      const data = {
        userId: 1,
        totalAmount: "1000",
        currency: "JPY",
        status: "pending",
      };

      const result = await repository.create(data);

      expect(result).toEqual(
        expect.objectContaining({
          userId: data.userId,
          totalAmount: data.totalAmount,
          currency: data.currency,
          status: data.status,
        })
      );
    });
  });

  describe("update", () => {
    it("注文を更新できること", async () => {
      const order = await repository.create({
        userId: 1,
        totalAmount: "1000",
        currency: "JPY",
      });

      const result = await repository.update(order.id, {
        status: "completed",
        stripeSessionId: "session_id",
        stripePaymentIntentId: "payment_intent_id",
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: order.id,
          status: "completed",
          stripeSessionId: "session_id",
          stripePaymentIntentId: "payment_intent_id",
        })
      );
    });

    it("存在しない注文の更新は失敗すること", async () => {
      const result = await repository.update(999, { status: "completed" });
      expect(result).toBeNull();
    });
  });
});
