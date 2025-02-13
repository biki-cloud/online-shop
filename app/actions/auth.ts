"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/payments/stripe";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { hashPassword, setSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";

const container = createContainer(db);
const userRepository = container.userRepository;

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const user = await userRepository.verifyPassword(email, password);

  if (!user) {
    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
      email,
      password,
    };
  }

  await setSession(user);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    return createCheckoutSession({
      userId: user.id,
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
  const { email, password, name } = data;

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    return {
      error: "このメールアドレスは既に登録されています。",
      email,
      password,
      name,
    };
  }

  const passwordHash = await hashPassword(password);

  const createdUser = await userRepository.create({
    email,
    passwordHash,
    name,
    role: "user",
  });

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
  redirect("/sign-in");
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

    const isValid = await userRepository.verifyPassword(
      user.email,
      currentPassword
    );

    if (!isValid) {
      return { error: "現在のパスワードが正しくありません。" };
    }

    if (currentPassword === newPassword) {
      return {
        error: "新しいパスワードは現在のパスワードと異なる必要があります。",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await userRepository.update(user.id, { passwordHash: newPasswordHash });

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

    const isValid = await userRepository.verifyPassword(user.email, password);
    if (!isValid) {
      return { error: "パスワードが正しくありません。" };
    }

    await userRepository.delete(user.id);

    (await cookies()).delete("session");
    redirect("/sign-in");
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

    await userRepository.update(user.id, { name, email });

    return { success: "アカウント情報を更新しました。" };
  }
);
