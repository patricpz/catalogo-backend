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
        role: 'LOJISTA',
      },
    });
    const { password: _p, ...rest } = user;
    return rest;
  }

  async findByIdSafe(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; email?: string; phone?: string | null; avatarUrl?: string | null },
  ): Promise<UserWithoutPassword> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email.toLowerCase().trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });
    const { password: _p, ...safe } = user;
    return safe;
  }
}
