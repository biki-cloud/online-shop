import { eq } from "drizzle-orm";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import type { Database } from "@/lib/db/drizzle";
import { User, NewUser, users } from "../db/schema";
import type { IUserRepository } from "./interfaces/user.repository";
import { comparePasswords } from "@/lib/auth/session";

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject("Database")
    private readonly db: Database
  ) {}

  async findAll(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.db
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
    const [updatedUser] = await this.db
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
    const [deletedUser] = await this.db
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
