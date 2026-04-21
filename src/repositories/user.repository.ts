import type { User } from "@prisma/client";
import { prisma } from "../config/database.js";

export type UserWithoutPassword = Omit<User, "password">;

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; passwordHash: string }): Promise<UserWithoutPassword> {
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.passwordHash,
      },
    });
    const { password: _p, ...rest } = user;
    return rest;
  }

  async findByIdSafe(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, createdAt: true },
    });
    return user;
  }
}
