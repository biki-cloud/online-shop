export interface User {
  id: number;
  name: string | null;
  email: string;
  passwordHash: string;
  role: string;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  password: string;
  role: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address1: string;
  address2: string;
  phoneNumber: string;
}>;
