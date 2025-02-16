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
import { hashPassword } from "@/lib/infrastructure/auth/session";
import type { NewUser, NewProduct } from "./schema";
import { sql } from "drizzle-orm";

async function clearTables() {
  console.log("🗑️ テーブルの内容を削除中...");

  // 外部キー制約があるため、削除順序が重要
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(products);
  await db.delete(users);

  // シーケンスをリセット
  await db.execute(sql`
    ALTER SEQUENCE users_id_seq RESTART WITH 1;
    ALTER SEQUENCE products_id_seq RESTART WITH 1;
    ALTER SEQUENCE carts_id_seq RESTART WITH 1;
    ALTER SEQUENCE cart_items_id_seq RESTART WITH 1;
    ALTER SEQUENCE orders_id_seq RESTART WITH 1;
    ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
  `);

  console.log("✅ テーブルの内容とシーケンスをリセットしました");
}

async function seedUsers() {
  console.log("🌱 ユーザーデータを作成中...");

  const testUsers: NewUser[] = [
    {
      name: "Test User",
      email: "test@example.com",
      passwordHash: await hashPassword("password123"),
      role: "user",
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: await hashPassword("admin123"),
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
      name: "クラシック ホワイト Tシャツ",
      description:
        "上質なコットン100%を使用した、シンプルで着回しやすいベーシックTシャツ。",
      price: "4900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      stock: 100,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "フローラル サマードレス",
      description:
        "軽やかな花柄プリントの夏向けワンピース。エレガントなデザインで、デイリーからパーティーまで幅広く活躍。",
      price: "12800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "デニムジャケット - ヴィンテージウォッシュ",
      description:
        "クラシックなデザインのデニムジャケット。ヴィンテージ加工が施された、こなれた雰囲気の一着。",
      price: "15800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザースニーカー - ホワイト",
      description:
        "上質なレザーを使用したミニマルデザインのスニーカー。どんなスタイルにも合わせやすい万能アイテム。",
      price: "13500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "トートバッグ - キャメル",
      description:
        "高級レザーを使用した大容量トートバッグ。ビジネスからカジュアルまで幅広く使える実用的なデザイン。",
      price: "24800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      stock: 25,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "アビエーターサングラス",
      description:
        "クラシックなアビエーターデザインのサングラス。UV400カット機能付き。",
      price: "16500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
      stock: 60,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ウールブレンドセーター - グレー",
      description:
        "上質なウールブレンド素材を使用した、暖かみのあるクルーネックセーター。",
      price: "9800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "スリムフィットチノパン - ベージュ",
      description:
        "コットンツイル素材を使用した、スリムフィットのチノパン。オフィスカジュアルにも最適。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ネイビー - ビキニ",
      description: "クラシックなデザインのビキニ。",
      price: "7500",
      currency: "JPY",
      imageUrl: "https://images.unsplash.com/photo-1582639590011-f5a8416d1101",
      stock: 70,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "リネンブレンドシャツ - ホワイト",
      description: "通気性の良いリネン混紡素材を使用した、爽やかな長袖シャツ。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
      stock: 65,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "カーゴパンツ - オリーブ",
      description:
        "機能的なポケットデザインのカーゴパンツ。アウトドアやカジュアルスタイルに最適。",
      price: "11800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ボーダーマリンTシャツ",
      description:
        "マリンテイストのボーダーTシャツ。夏のカジュアルスタイルに欠かせないアイテム。",
      price: "5900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80",
      stock: 80,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "プリーツスカート - ブラック",
      description:
        "エレガントなプリーツデザインのミディ丈スカート。オフィスからお出かけまで幅広く活躍。",
      price: "13500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーブーツ - ブラウン",
      description:
        "本革使用のクラシカルなデザインブーツ。耐久性と快適さを兼ね備えた一足。",
      price: "28800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ダウンジャケット - ブラック",
      description:
        "軽量で暖かい高機能ダウンジャケット。防水加工済みで雨や雪にも対応。",
      price: "32800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ワイドレッグパンツ - グレー",
      description:
        "トレンド感のあるワイドシルエットのパンツ。上品な落ち感と履き心地の良さが特徴。",
      price: "12800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ニットカーディガン - ベージュ",
      description:
        "柔らかな肌触りのニットカーディガン。季節の変わり目に重宝する一枚。",
      price: "14500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583846717393-dc2412c95ed7?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "シルクブラウス - アイボリー",
      description:
        "上質なシルク素材を使用したエレガントなブラウス。オフィスからパーティーまで対応可能。",
      price: "18800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "デニムショートパンツ",
      description: "カジュアルなデニムショートパンツ。夏のスタイリングに最適。",
      price: "7800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
      stock: 60,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ストライプシャツドレス",
      description:
        "爽やかなストライプ柄のシャツワンピース。オフィスカジュアルにも休日スタイルにも。",
      price: "16500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      stock: 35,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レザーミニスカート - ブラック",
      description:
        "スタイリッシュなレザーミニスカート。エッジの効いた大人のカジュアルスタイルに。",
      price: "19800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "オーバーサイズパーカー - グレー",
      description:
        "トレンド感のあるオーバーサイズシルエットのパーカー。リラックススタイルの定番アイテム。",
      price: "11800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      stock: 55,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "クロップドTシャツ - ピンク",
      description:
        "トレンディなクロップド丈のTシャツ。ハイウエストボトムとの相性抜群。",
      price: "5500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      stock: 70,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ハイウエストジーンズ - インディゴ",
      description:
        "美脚効果抜群のハイウエストデニム。ストレッチ素材で快適な履き心地。",
      price: "13800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      stock: 45,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "レインコート - クリア",
      description:
        "スタイリッシュなデザインの透明レインコート。雨の日のお出かけも楽しくなる一着。",
      price: "8900",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "バンドカラーシャツ - サックスブルー",
      description:
        "スタンドカラーがスタイリッシュなシャツ。モダンなビジネススタイルに最適。",
      price: "10800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
      stock: 50,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "ベロアワンピース - バーガンディ",
      description:
        "上品な光沢感のあるベロア素材のワンピース。パーティーシーンにぴったり。",
      price: "21800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      stock: 30,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "チェスターコート - キャメル",
      description:
        "クラシカルなデザインのチェスターコート。オンオフ問わず活躍する定番アウター。",
      price: "35800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80",
      stock: 25,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "アスレチックレギンス - ブラック",
      description:
        "吸汗速乾機能付きのスポーツレギンス。ヨガやジムでの活動に最適。",
      price: "7800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
      stock: 65,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "フリルブラウス - ホワイト",
      description:
        "フェミニンなフリルディテールのブラウス。デイリーからオフィスまで幅広く活用可能。",
      price: "12500",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80",
      stock: 40,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      deletedAt: null,
    },
    {
      name: "バイカーレザージャケット",
      description:
        "本革使用のクラシカルなバイカージャケット。エッジの効いたスタイリングの主役に。",
      price: "45800",
      currency: "JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      stock: 20,
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
