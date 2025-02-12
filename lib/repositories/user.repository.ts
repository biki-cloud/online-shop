import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { User, NewUser, users } from "../db/schema";
import { IUserRepository } from "./interfaces/user.repository";
import { comparePasswords } from "@/lib/auth/session";

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  async findById(id: number): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return user;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser ?? null;
  }

  async delete(id: number): Promise<boolean> {
    const [deletedUser] = await db
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return !!deletedUser;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await comparePasswords(password, user.passwordHash);
    return isValid ? user : null;
  }
}

export const userRepository = new UserRepository();
