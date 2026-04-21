import type { Request, RequestHandler } from 'express';
import { StoreService } from '../services/store.service.js';
import { createStoreBodySchema, updateStoreBodySchema } from '../schemas/store.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export class StoreController {
  constructor(private readonly service: StoreService = new StoreService()) {}

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

  update: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const body = updateStoreBodySchema.parse(req.body);
    const store = await this.service.update(userId, body);
    res.json({ store });
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
}
