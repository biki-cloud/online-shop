import { OrderRepository } from "../order.repository";
import { MockOrderRepository } from "@/lib/test-utils/mock-repositories";
import { Order, OrderItem } from "@/lib/db/schema";

describe("OrderRepository", () => {
  let repository: MockOrderRepository;

  beforeEach(() => {
    repository = new MockOrderRepository();
  });

  describe("findByUserId", () => {
    it("ユーザーの注文を見つけられること", async () => {
      const userId = 1;
      const order = await repository.create({
        userId,
        totalAmount: "1000",
        currency: "JPY",
      });

      const result = await repository.findByUserId(userId);
      expect(result).toEqual([order]);
    });

    it("他のユーザーの注文は見つからないこと", async () => {
      const userId = 1;
      await repository.create({
        userId: 2,
        totalAmount: "1000",
        currency: "JPY",
      });

      const result = await repository.findByUserId(userId);
      expect(result).toHaveLength(0);
    });
  });

  describe("createOrderItems", () => {
    it("注文アイテムを作成できること", async () => {
      const orderId = 1;
      const items = [
        {
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "JPY",
        },
        {
          productId: 2,
          quantity: 1,
          price: "2000",
          currency: "JPY",
        },
      ];

      const result = await repository.createOrderItems(orderId, items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          orderId,
          productId: items[0].productId,
          quantity: items[0].quantity,
          price: items[0].price,
          currency: items[0].currency,
        })
      );
    });
  });

  describe("getOrderItems", () => {
    it("注文アイテムを取得できること", async () => {
      const orderId = 1;
      const items = [
        {
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "JPY",
        },
      ];

      await repository.createOrderItems(orderId, items);
      const result = await repository.getOrderItems(orderId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          orderId,
          productId: items[0].productId,
          quantity: items[0].quantity,
          price: items[0].price,
          currency: items[0].currency,
        })
      );
    });

    it("他の注文のアイテムは取得されないこと", async () => {
      const orderId = 1;
      const items = [
        {
          productId: 1,
          quantity: 2,
          price: "1000",
          currency: "JPY",
        },
      ];

      await repository.createOrderItems(2, items);
      const result = await repository.getOrderItems(orderId);

      expect(result).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("注文のステータスを更新できること", async () => {
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
