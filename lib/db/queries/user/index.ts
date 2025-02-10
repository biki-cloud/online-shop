import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../drizzle";
import { users } from "../../schema";
import { cookies } from "next/headers";
import { verifyToken } from "../../../auth/session";
import { mockUser } from "../../../mock/user";
import { USE_MOCK } from "../../../config";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  if (USE_MOCK) {
    return mockUser;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  return user.length === 0 ? null : user[0];
}
