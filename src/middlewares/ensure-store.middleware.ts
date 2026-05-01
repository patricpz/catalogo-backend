import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { StoreService } from '../services/store.service.js';

const storeService = new StoreService();

/** Garante 1 loja por utilizador (JWT já populou `req.auth`). */
export const ensureStoreMiddleware: RequestHandler = asyncHandler(async (req, _res, next) => {
  const auth = req.auth;
  if (!auth?.sub || !auth?.email) {
    next();
    return;
  }
  await storeService.ensureDefaultStoreForUser(auth.sub, auth.email);
  next();
});
