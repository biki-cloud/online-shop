"use server";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { User, users, type NewUser } from "@/lib/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getUser } from "@/lib/db/queries";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { mockUser } from "@/lib/mock/user";

const USE_MOCK = process.env.USE_MOCK === "true";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  if (USE_MOCK) {
    await setSession(mockUser);
    redirect("/home");
  }

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!foundUser) {
    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
      email,
      password,
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
      email,
      password,
    };
  }

  await setSession(foundUser);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    return createCheckoutSession({
      userId: foundUser.id,
      cart: null,
      cartItems: [],
    });
  }

  redirect("/home");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  if (USE_MOCK) {
    await setSession(mockUser);
    redirect("/home");
  }
  const { email, password, name } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "このメールアドレスは既に登録されています。",
      email,
      password,
      name,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    name,
    role: "user",
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: "ユーザーの作成に失敗しました。",
      email,
      password,
      name,
    };
  }

  await setSession(createdUser);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    return createCheckoutSession({
      userId: createdUser.id,
      cart: null,
      cartItems: [],
    });
  }

  redirect("/home");
});

export async function signOut() {
  (await cookies()).delete("session");
  redirect("/login");
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return { error: "現在のパスワードが正しくありません。" };
    }

    if (currentPassword === newPassword) {
      return {
        error: "新しいパスワードは現在のパスワードと異なる必要があります。",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return { success: "パスワードを更新しました。" };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "パスワードが正しくありません。" };
    }

    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`,
      })
      .where(eq(users.id, user.id));

    (await cookies()).delete("session");
    redirect("/login");
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100),
  email: z.string().email("メールアドレスの形式が正しくありません"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, user.id));

    return { success: "アカウント情報を更新しました。" };
  }
);
