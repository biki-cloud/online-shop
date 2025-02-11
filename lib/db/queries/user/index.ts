import { db } from "../../drizzle";
import { users } from "../../schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users);
    console.log("[getAllUsers] All users in database:", allUsers.length);
    return allUsers;
  } catch (error) {
    console.error("[getAllUsers] Error fetching users:", error);
    return [];
  }
}

export async function getUser() {
  console.log("[getUser] Getting user...");
  const session = await getSession();
  console.log("[getUser] Session:", session?.user.id);
  if (!session) return null;

  console.log("[getUser] Executing query with user ID:", session.user.id);

  try {
    // まず全ユーザーを確認
    await getAllUsers();

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    console.log("[getUser] Query result rows:", rows.length);

    const user = rows[0];
    console.log("[getUser] Selected user:", user.email);
    return user;
  } catch (error) {
    console.error("[getUser] Error executing query:", error);
    return null;
  }
}
