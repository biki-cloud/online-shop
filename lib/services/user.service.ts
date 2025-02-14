import { compare } from "bcryptjs";
import { User, CreateUserInput, UpdateUserInput } from "@/lib/domain/user";
import { IUserRepository } from "../repositories/interfaces/user.repository";
import { IUserService } from "./interfaces/user.service";

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async create(data: CreateUserInput): Promise<User> {
    return await this.userRepository.create(data);
  }

  async update(id: number, data: UpdateUserInput): Promise<User | null> {
    return await this.userRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async validatePassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await compare(password, user.passwordHash);
    return isValid ? user : null;
  }
}
