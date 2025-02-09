import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "@/lib/auth/session";
import { getUser, updateUserStripeCustomerId } from "@/lib/db/queries/users";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getUser(session.user.id);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Stripeの顧客IDがない場合は新規作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id.toString(),
        },
      });
      customerId = customer.id;
      await updateUserStripeCustomerId(user.id, customerId);
    }

    // セットアップ用のセッションを作成
    const setupSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "setup",
      success_url: `${process.env.BASE_URL}/settings/payment?success=true`,
      cancel_url: `${process.env.BASE_URL}/settings/payment?success=false`,
    });

    return NextResponse.json({ url: setupSession.url });
  } catch (error) {
    console.error("Error creating setup session:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
