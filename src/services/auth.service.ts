import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { UserWithoutPassword } from "../repositories/user.repository.js";
import type { UserRole } from "@prisma/client";
import { StoreService } from "./store.service.js";

const SALT_ROUNDS = 12;

export type AuthTokens = { accessToken: string; expiresIn: string };

export class AuthService {
  constructor(
    private readonly users: UserRepository = new UserRepository(),
    private readonly stores: StoreService = new StoreService(),
  ) {}

  async register(
    email: string,
    password: string
  ): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new AppError(409, "E-mail já cadastrado", "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.users.create({ email, passwordHash });
    await this.stores.ensureDefaultStoreForUser(user.id, user.email);
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return { user, tokens };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserWithoutPassword; tokens: AuthTokens }> {
    const userRecord = await this.users.findByEmail(email);
    if (!userRecord) {
      throw new AppError(401, "Credenciais inválidas", "INVALID_CREDENTIALS");
    }

    const ok = await bcrypt.compare(password, userRecord.password);
    if (!ok) {
      throw new AppError(401, "Credenciais inválidas", "INVALID_CREDENTIALS");
    }

    const { password: _p, ...user } = userRecord;
    await this.stores.ensureDefaultStoreForUser(user.id, user.email);
    await this.users.updateLastLogin(user.id);
    const tokens = this.issueTokens(user.id, user.email, user.role);
    return { user, tokens };
  }

  async getProfile(userId: string): Promise<UserWithoutPassword> {
    const user = await this.users.findByIdSafe(userId);
    if (!user) {
      throw new AppError(404, "Usuário não encontrado", "USER_NOT_FOUND");
    }
    return user;
  }

  private issueTokens(userId: string, email: string, role: UserRole): AuthTokens {
    const payload = { sub: userId, email, role };
    const accessToken = jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);
    return { accessToken, expiresIn: env.jwtExpiresIn };
  }
}
