"use server";

import { User, NewUser } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { createContainer } from "@/lib/di/container";

const container = createContainer(db);

export async function getUsers(): Promise<User[]> {
  return await container.userRepository.findAll();
}

export async function getUserById(id: number): Promise<User | null> {
  return await container.userRepository.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await container.userRepository.findByEmail(email);
}

export async function createUser(data: NewUser): Promise<User> {
  return await container.userRepository.create(data);
}

export async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User | null> {
  return await container.userRepository.update(id, data);
}

export async function deleteUser(id: number): Promise<boolean> {
  return await container.userRepository.delete(id);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return await container.userRepository.findById(session.user.id);
}

export async function verifyUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  return await container.userRepository.verifyPassword(email, password);
}
