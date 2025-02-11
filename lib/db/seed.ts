import { stripe } from "../payments/stripe";
import { db } from "./drizzle";
import {
  users,
  products,
  carts,
  cartItems,
  orders,
  orderItems,
} from "./schema";
import { hashPassword } from "@/lib/auth/session";
import type { NewUser, NewProduct } from "./schema";

async function clearTables() {
  console.log("🗑️ テーブルの内容を削除中...");

  // 外部キー制約があるため、削除順序が重要
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(products);
  await db.delete(users);

  console.log("✅ テーブルの内容を削除しました");
}

async function seedUsers() {
  console.log("🌱 ユーザーデータを作成中...");

  const testUsers: NewUser[] = [
    {
      name: "Test User",
      email: "test@example.com",
      passwordHash: "dummy_hash_1",
      role: "user",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "dummy_hash_2",
      role: "admin",
    },
  ];

  for (const user of testUsers) {
    await db.insert(users).values(user);
  }

  console.log("✅ ユーザーデータを作成しました");
}

async function seedProducts() {
  console.log("🌱 商品データを作成中...");

  const testProducts: NewProduct[] = [
    {
      name: "コーヒー豆 100g",
      description: "深煎りの香り高いコーヒー豆です。",
      price: "500",
      currency: "JPY",
      stock: 100,
      imageUrl: "https://example.com/coffee-beans.jpg",
    },
    {
      name: "紅茶 50g",
      description: "芳醇な香りのアールグレイです。",
      price: "800",
      currency: "JPY",
      stock: 50,
      imageUrl: "https://example.com/earl-grey.jpg",
    },
    {
      name: "緑茶 100g",
      description: "香り高い日本産の緑茶です。",
      price: "1000",
      currency: "JPY",
      stock: 30,
      imageUrl: "https://example.com/green-tea.jpg",
    },
  ];

  for (const product of testProducts) {
    await db.insert(products).values(product);
  }

  console.log("✅ 商品データを作成しました");
}

async function main() {
  try {
    await clearTables();
    await seedUsers();
    await seedProducts();

    console.log("🎉 データベースの初期化が完了しました");
    process.exit(0);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
