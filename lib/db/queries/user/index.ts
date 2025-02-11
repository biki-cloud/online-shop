import { db } from "../../drizzle";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function getUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((rows) => rows[0]);

  return user;
}
