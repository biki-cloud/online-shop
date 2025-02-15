"use server";

import { hash } from "bcryptjs";
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/domain/user";
import { getContainer } from "@/lib/di/container";
import type { IUserService } from "@/lib/services/interfaces/user.service";
import { getSession } from "@/lib/auth/session";

function getUserService() {
  const container = getContainer();
  return container.resolve<IUserService>("UserService");
}

export async function getUserById(id: number): Promise<User | null> {
  const userService = getUserService();
  return await userService.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userService = getUserService();
  return await userService.findByEmail(email);
}

export async function createUser(
  data: Omit<CreateUserInput, "passwordHash"> & { password: string }
): Promise<User> {
  const userService = getUserService();
  const passwordHash = await hash(data.password, 10);
  const { password, ...rest } = data;
  return await userService.create({
    ...rest,
    passwordHash,
  });
}

export async function updateUser(
  id: number,
  data: Omit<UpdateUserInput, "passwordHash"> & { password?: string }
): Promise<User | null> {
  const userService = getUserService();
  const updateData: UpdateUserInput = { ...data };

  if (data.password) {
    updateData.passwordHash = await hash(data.password, 10);
    delete data.password;
  }

  return await userService.update(id, updateData);
}

export async function deleteUser(id: number): Promise<boolean> {
  const userService = getUserService();
  return await userService.delete(id);
}

export async function validateUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  const userService = getUserService();
  return await userService.validatePassword(email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const userService = getUserService();
  return await userService.findById(session.user.id);
}
