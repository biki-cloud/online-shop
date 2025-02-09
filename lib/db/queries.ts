import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export async function getUser(userId: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}
