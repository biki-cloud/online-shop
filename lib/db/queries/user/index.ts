import { db } from "../../drizzle";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { mockUsers, authenticateMockUser } from "../../../mock/user";

const USE_MOCK = process.env.USE_MOCK === "true";

export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  if (USE_MOCK) {
    return mockUsers[0];
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return user;
}
