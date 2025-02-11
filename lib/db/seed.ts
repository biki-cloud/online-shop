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
      id: 1,
      name: "プロテインシェイク - バニラ",
      description:
        "高品質なホエイプロテインを使用した美味しいバニラ風味のプロテインシェイク。1食あたり20gのタンパク質を含有。",
      price: "3500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=800&q=80",
      stock: 100,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      id: 2,
      name: "ヨガマット - プレミアム",
      description:
        "環境に優しい素材を使用した、滑り止め付きの高品質ヨガマット。厚さ6mm。",
      price: "5000",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      id: 3,
      name: "ダンベル 5kg セット",
      description:
        "耐久性のある素材で作られた5kgのダンベルセット。快適なグリップ付き。",
      price: "4500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      id: 4,
      name: "スポーツドリンク 24本セット",
      description:
        "電解質とビタミンを含む、運動時の水分補給に最適なスポーツドリンク。",
      price: "2800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=800&q=80",
      stock: 200,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      id: 5,
      name: "トレーニンググローブ",
      description:
        "手のひらの保護と滑り止め効果があるトレーニング用グローブ。サイズ：M",
      price: "2000",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=800&q=80",
      stock: 75,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      id: 6,
      name: "ジムバッグ - プロフェッショナル",
      description: "大容量で多機能なジムバッグ。シューズ収納部屋付き。",
      price: "6500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
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
