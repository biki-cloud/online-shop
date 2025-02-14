"use server";

import { hash } from "bcryptjs";
import { User, CreateUserInput, UpdateUserInput } from "@/lib/domain/user";
import { getContainer } from "@/lib/di/container-provider";
import { getSession } from "@/lib/auth/session";

export async function getUserById(id: number): Promise<User | null> {
  const container = getContainer();
  return await container.userService.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const container = getContainer();
  return await container.userService.findByEmail(email);
}

export async function createUser(
  data: Omit<CreateUserInput, "passwordHash"> & { password: string }
): Promise<User> {
  const container = getContainer();
  const passwordHash = await hash(data.password, 10);
  const { password, ...rest } = data;
  return await container.userService.create({
    ...rest,
    passwordHash,
  });
}

export async function updateUser(
  id: number,
  data: Omit<UpdateUserInput, "passwordHash"> & { password?: string }
): Promise<User | null> {
  const container = getContainer();
  const updateData: UpdateUserInput = { ...data };

  if (data.password) {
    updateData.passwordHash = await hash(data.password, 10);
    delete data.password;
  }

  return await container.userService.update(id, updateData);
}

export async function deleteUser(id: number): Promise<boolean> {
  const container = getContainer();
  return await container.userService.delete(id);
}

export async function validateUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  const container = getContainer();
  return await container.userService.validatePassword(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const container = getContainer();
  return await container.userService.findById(session.user.id);
}
