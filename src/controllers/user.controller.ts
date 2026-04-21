import type { RequestHandler } from "express";
import { AuthService } from "../services/auth.service.js";
import { registerBodySchema, loginBodySchema } from "../schemas/auth.schema.js";
import { asyncHandler } from "../utils/async-handler.js";

export class UserController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

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
}
