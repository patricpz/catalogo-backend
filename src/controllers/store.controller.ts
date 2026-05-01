import type { Request, RequestHandler } from 'express';
import { StoreService } from '../services/store.service.js';
import {
  createStoreBodySchema,
  updateStoreBodySchema,
  updateStoreColorBodySchema,
  updateStoreHoursBodySchema,
} from '../schemas/store.schema.js';
import { asyncHandler } from '../utils/async-handler.js';
import { AppError } from '../utils/app-error.js';

export class StoreController {
  constructor(private readonly service: StoreService = new StoreService()) {}

  private async assertStoreAccess(userId: string, storeId: string): Promise<void> {
    const myStore = await this.service.getByUserId(userId);
    if (myStore.id !== storeId) {
      throw new AppError(403, 'Sem permissão para acessar esta loja', 'STORE_FORBIDDEN');
    }
  }

  create: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const body = createStoreBodySchema.parse(req.body);
    const store = await this.service.create(userId, body);
    res.status(201).json({ store });
  });

  getMe: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const store = await this.service.getByUserId(userId);
    res.json({ store });
  });

  getBySlug: RequestHandler = asyncHandler(async (req, res) => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    if (!slug) {
      res.status(400).json({ message: 'Slug obrigatório' });
      return;
    }
    const store = await this.service.getBySlug(slug);
    res.json({ store });
  });

  getById: RequestHandler = asyncHandler(async (req, res) => {
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!storeId) {
      res.status(400).json({ message: 'ID da loja obrigatório' });
      return;
    }
    const store = await this.service.getById(storeId);
    res.json(store);
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (storeId) {
      await this.assertStoreAccess(userId, storeId);
    }
    const body = updateStoreBodySchema.parse(req.body);
    const store = await this.service.update(userId, body);
    res.json({ store });
  });

  updateHours: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!storeId) throw new AppError(400, 'ID da loja obrigatório', 'STORE_ID_REQUIRED');
    await this.assertStoreAccess(userId, storeId);
    const body = updateStoreHoursBodySchema.parse(req.body);
    const store = await this.service.updateHours(userId, body.opening_hours);
    res.json({ store });
  });

  updateColor: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!storeId) throw new AppError(400, 'ID da loja obrigatório', 'STORE_ID_REQUIRED');
    await this.assertStoreAccess(userId, storeId);
    const body = updateStoreColorBodySchema.parse(req.body);
    const store = await this.service.updatePrimaryColor(userId, body.primary_color);
    res.json({ store });
  });

  getAlerts: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!storeId) {
      res.status(400).json({ message: 'ID da loja obrigatório' });
      return;
    }
    await this.assertStoreAccess(userId, storeId);
    const alerts = await this.service.getAlerts(storeId);
    res.json({ alerts });
  });

  getPlan: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const storeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!storeId) {
      res.status(400).json({ message: 'ID da loja obrigatório' });
      return;
    }
    await this.assertStoreAccess(userId, storeId);
    const plan = await this.service.getPlanUsage(storeId);
    res.json(plan);
  });

  delete: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    await this.service.delete(userId);
    res.json({ message: 'Loja deletada com sucesso' });
  });

  uploadImage: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const file = req.file!;
    const store = await this.service.uploadStoreImage(userId, file);
    res.json({ url: store.image, store });
  });

  uploadLogo: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const file = req.file!;
    const store = await this.service.uploadStoreLogo(userId, file);
    res.json({ logo_url: store.logoUrl, store });
  });
}
