import { db } from "../../drizzle";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { mockUsers } from "../../../mock/user";

const USE_MOCK = process.env.USE_MOCK === "true";

export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  if (USE_MOCK) {
    const mockUser = mockUsers.find((user) => user.id === session.user.id);
    if (!mockUser) return null;
    return mockUser;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return user;
}
