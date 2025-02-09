import { User } from "@/lib/db/schema";

export const mockUser: User = {
  id: 1,
  name: "テストユーザー",
  email: "test@example.com",
  passwordHash: "dummy_hash",
  role: "member",
  stripeCustomerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

let mockUserData = { ...mockUser };

export function getMockUser(): User {
  return { ...mockUserData };
}

export function updateMockUser(updates: Partial<User>): User {
  mockUserData = {
    ...mockUserData,
    ...updates,
    updatedAt: new Date(),
  };
  return { ...mockUserData };
}

export function resetMockUser(): void {
  mockUserData = { ...mockUser };
}
