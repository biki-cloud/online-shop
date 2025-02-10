import { User, type NewUser } from "@/lib/db/schema";
import { comparePasswords } from "@/lib/auth/session";

// グローバルなモックユーザーデータ
let mockUsers: User[] = [
  {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user",
    passwordHash: "xxxx",
    deletedAt: null,
  },
  {
    id: 2,
    email: "admin@example.com",
    name: "Admin User",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "admin",
    passwordHash: "xxx",
    deletedAt: null,
  },
];

export async function authenticateMockUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = mockUsers.find((u) => u.email === email);
  if (!user) return null;

  return user;
}

export function addMockUser(newUser: NewUser): User {
  const lastId = mockUsers[mockUsers.length - 1]?.id ?? 0;
  const user: User = {
    id: lastId + 1,
    email: newUser.email,
    name: newUser.name ?? null,
    passwordHash: newUser.passwordHash,
    role: newUser.role ?? "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  mockUsers.push(user);
  return user;
}

// モックユーザーデータのエクスポート
export { mockUsers };

// 個別のエクスポートも残しておく（既存のコードとの互換性のため）
export const mockUser = mockUsers[0];
export const mockAdminUser = mockUsers[1];
