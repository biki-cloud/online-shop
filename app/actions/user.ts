"use server";

import { userRepository } from "@/lib/repositories/user.repository";
import { User, NewUser } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function getUsers(): Promise<User[]> {
  return await userRepository.findAll();
}

export async function getUserById(id: number): Promise<User | null> {
  return await userRepository.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await userRepository.findByEmail(email);
}

export async function createUser(data: NewUser): Promise<User> {
  return await userRepository.create(data);
}

export async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User | null> {
  return await userRepository.update(id, data);
}

export async function deleteUser(id: number): Promise<boolean> {
  return await userRepository.delete(id);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) return null;
  return await userRepository.findById(session.user.id);
}

export async function verifyUserPassword(
  email: string,
  password: string
): Promise<User | null> {
  return await userRepository.verifyPassword(email, password);
}
