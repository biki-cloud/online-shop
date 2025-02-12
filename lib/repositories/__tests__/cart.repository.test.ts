import { CartRepository } from "../cart.repository";
import { MockCartRepository } from "@/lib/test-utils/mock-repositories";
import { Cart, CartItem } from "@/lib/db/schema";

describe("CartRepository", () => {
  let repository: MockCartRepository;

  beforeEach(() => {
    repository = new MockCartRepository();
  });

  describe("findActiveCartByUserId", () => {
    it("アクティブなカートを見つけられること", async () => {
      const userId = 1;
      const cart = await repository.create({ userId, status: "active" });

      const result = await repository.findActiveCartByUserId(userId);
      expect(result).toEqual(cart);
    });

    it("非アクティブなカートは見つからないこと", async () => {
      const userId = 1;
      await repository.create({ userId, status: "completed" });

      const result = await repository.findActiveCartByUserId(userId);
      expect(result).toBeNull();
    });
  });

  describe("addToCart", () => {
    it("新しい商品をカートに追加できること", async () => {
      const cartId = 1;
      const productId = 1;
      const quantity = 2;

      const result = await repository.addToCart(cartId, productId, quantity);

      expect(result).toEqual(
        expect.objectContaining({
          cartId,
          productId,
          quantity,
        })
      );
    });

    it("既存の商品の数量を更新できること", async () => {
      const cartId = 1;
      const productId = 1;
      const initialQuantity = 2;
      const additionalQuantity = 3;

      await repository.addToCart(cartId, productId, initialQuantity);
      const result = await repository.addToCart(
        cartId,
        productId,
        additionalQuantity
      );

      expect(result.quantity).toBe(initialQuantity + additionalQuantity);
    });
  });

  describe("updateCartItemQuantity", () => {
    it("カート内の商品の数量を更新できること", async () => {
      const cartId = 1;
      const productId = 1;
      const initialQuantity = 2;
      const newQuantity = 5;

      const item = await repository.addToCart(
        cartId,
        productId,
        initialQuantity
      );
      const result = await repository.updateCartItemQuantity(
        item.id,
        newQuantity
      );

      expect(result?.quantity).toBe(newQuantity);
    });

    it("存在しない商品の更新は失敗すること", async () => {
      const result = await repository.updateCartItemQuantity(999, 5);
      expect(result).toBeNull();
    });
  });

  describe("removeFromCart", () => {
    it("カートから商品を削除できること", async () => {
      const cartId = 1;
      const productId = 1;
      const item = await repository.addToCart(cartId, productId, 1);

      const result = await repository.removeFromCart(item.id);
      expect(result).toBe(true);

      const items = await repository.getCartItems(cartId);
      expect(items).toHaveLength(0);
    });

    it("存在しない商品の削除は失敗すること", async () => {
      const result = await repository.removeFromCart(999);
      expect(result).toBe(false);
    });
  });

  describe("clearCart", () => {
    it("カートをクリアできること", async () => {
      const userId = 1;
      await repository.create({ userId, status: "active" });

      await repository.clearCart(userId);

      const cart = await repository.findActiveCartByUserId(userId);
      expect(cart).toBeNull();
    });
  });
});
