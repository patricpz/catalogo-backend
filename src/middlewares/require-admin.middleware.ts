import type { RequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';

export const requireAdminMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.auth) {
    next(new AppError(401, 'Não autenticado', 'UNAUTHORIZED'));
    return;
  }

  if (req.auth.role !== 'ADMIN') {
    next(new AppError(403, 'Acesso negado: somente ADMIN', 'FORBIDDEN'));
    return;
  }

  next();
};
