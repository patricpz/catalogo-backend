import { randomUUID } from 'node:crypto';
import type { RequestHandler } from "express";
import { AuthService } from "../services/auth.service.js";
import { registerBodySchema, loginBodySchema } from "../schemas/auth.schema.js";
import { updateUserProfileBodySchema } from '../schemas/user.schema.js';
import { asyncHandler } from "../utils/async-handler.js";
import { UserRepository } from '../repositories/user.repository.js';
import { R2StorageService } from '../services/r2-storage.service.js';
import { extensionForMime } from '../utils/image-file.js';

export class UserController {
  constructor(
    private readonly authService: AuthService = new AuthService(),
    private readonly users: UserRepository = new UserRepository(),
    private readonly storage: R2StorageService = new R2StorageService(),
  ) {}

  register: RequestHandler = asyncHandler(async (req, res) => {
    const body = registerBodySchema.parse(req.body);
    const result = await this.authService.register(body.email, body.password);
    res.status(201).json({
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  });

  login: RequestHandler = asyncHandler(async (req, res) => {
    const body = loginBodySchema.parse(req.body);
    const result = await this.authService.login(body.email, body.password);
    res.json({
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  });

  me: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth?.sub;
    if (!userId) {
      res.status(401).json({ message: "Não autenticado" });
      return;
    }
    const user = await this.authService.getProfile(userId);
    res.json({ user });
  });

  getProfile: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const user = await this.authService.getProfile(userId);
    res.json({ user });
  });

  updateProfile: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const body = updateUserProfileBodySchema.parse(req.body);
    const user = await this.users.updateProfile(userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      avatarUrl: body.avatar_url,
    });
    res.json({ user });
  });

  uploadAvatar: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const file = req.file!;
    const ext = extensionForMime(file.mimetype);
    const key = `users/${userId}/avatar/${randomUUID()}.${ext}`;
    const avatarUrl = await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    const user = await this.users.updateProfile(userId, { avatarUrl });
    res.json({ avatar_url: avatarUrl, user });
  });
}
