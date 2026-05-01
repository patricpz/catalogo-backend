import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    next(new AppError(401, "Token não informado", "UNAUTHORIZED"));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & { email?: string; role?: string };
    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "ADMIN" && decoded.role !== "LOJISTA" && decoded.role !== "CLIENTE")
    ) {
      next(new AppError(401, "Token inválido", "INVALID_TOKEN"));
      return;
    }
    req.auth = { sub: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch {
    next(new AppError(401, "Token inválido ou expirado", "INVALID_TOKEN"));
  }
};
