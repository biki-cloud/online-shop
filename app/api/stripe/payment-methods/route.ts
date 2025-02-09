import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { getServerSession } from "@/lib/auth/session";
import { getUser } from "@/lib/db/queries/users";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await getUser(session.user.id);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((method) => ({
        id: method.id,
        brand: method.card?.brand,
        last4: method.card?.last4,
        expMonth: method.card?.exp_month,
        expYear: method.card?.exp_year,
      })),
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
