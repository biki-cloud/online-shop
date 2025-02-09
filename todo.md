### 方法 1: Stripe Checkout + 保存されたカード

Stripe Checkout を使用すると、ユーザーが初回決済時にカード情報を保存し、次回以降の支払いを簡単にできます。Stripe がカード情報を管理するため、セキュリティ面でも安全です。

---

## **1. 基本の流れ**

1. **Stripe Customer を作成**（ユーザーアカウントと紐づける）
2. **Checkout セッションを作成**（支払いとカード情報保存の設定）
3. **ユーザーが決済を完了**（Stripe がカード情報を保存）
4. **次回の支払いでカードを自動利用**（再入力不要で決済）

---

## **2. 実装手順**

### **① 顧客情報（Customer）を作成**

支払い方法を保存するには、ユーザーごとに `Customer` を作成する必要があります。

```ts
const customer = await stripe.customers.create({
  email: "user@example.com",
  name: "ユーザー名",
});
```

この `customer.id` をデータベースに保存しておきます。

---

### **② Checkout セッションを作成**

Checkout セッションを作成し、`setup_future_usage: 'off_session'` を指定します。

```ts
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"], // カード決済を許可
  mode: "payment",
  customer: customer.id, // 先ほど作成した Customer を指定
  line_items: [
    {
      price_data: {
        currency: "jpy",
        product_data: { name: "商品名" },
        unit_amount: 1000, // 価格（例: 1000円）
      },
      quantity: 1,
    },
  ],
  payment_intent_data: {
    setup_future_usage: "off_session", // カードを保存して次回以降に使う
  },
  success_url: "https://your-site.com/success", // 成功時リダイレクト
  cancel_url: "https://your-site.com/cancel", // キャンセル時リダイレクト
});
```

この Checkout ページにユーザーをリダイレクトすると、Stripe 側で支払いを処理し、カードを保存してくれます。

---

### **③ ユーザーが決済を完了**

ユーザーが決済を完了すると、Stripe がそのカード情報を `Customer` に紐づけます。

`setup_future_usage: 'off_session'` を指定したことで、次回以降の決済時にユーザーが手動でカードを入力する必要がなくなります。

---

### **④ 保存したカードで次回の決済**

次回の支払い時は、保存されたカード情報を使い、`PaymentIntent` を作成するだけで決済可能です。

```ts
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // 価格（例: 2000円）
  currency: "jpy",
  customer: customer.id, // 保存された Customer を指定
  payment_method: "pm_xxxxxxx", // Customer に紐づいた PaymentMethod ID
  off_session: true, // ユーザーの操作なしで決済
  confirm: true, // すぐに決済を確定
});
```

この処理により、ユーザーが手動でカード情報を入力せずに決済できます。

---

## **3. まとめ**

✅ **初回の決済時にカード情報を保存**
✅ **Stripe がカード情報を管理するため、安全性が高い**
✅ **次回の決済時は入力不要でスムーズに支払い**

この方法を使うことで、ユーザーの利便性を向上させつつ、安全なカード情報管理が可能になります！
