import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { USE_MOCK } from "../../../config";
import { mockUser } from "@/lib/mock/user";

export async function getUser(id: number) {
  if (USE_MOCK) {
    return mockUser;
  }
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result;
}

export async function updateUserStripeCustomerId(
  userId: number,
  stripeCustomerId: string
) {
  await db
    .update(users)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
