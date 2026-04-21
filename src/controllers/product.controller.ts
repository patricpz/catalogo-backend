import type { Request, Response, RequestHandler } from 'express';
import { ProductService } from '../services/product.service.js';
import { createProductBodySchema, updateProductBodySchema } from '../schemas/product.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

function getParam(req: Request, key: string): string {
  const value = req.params[key];
  if (Array.isArray(value)) throw new Error(`Missing param: ${key}`);
  if (!value) throw new Error(`Missing param: ${key}`);
  return value;
}

export class ProductController {
  constructor(private readonly service: ProductService = new ProductService()) {}

  create: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const body = createProductBodySchema.parse(req.body);
    const product = await this.service.create(userId, body);
    res.status(201).json({ product });
  });

  list: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const products = await this.service.listByUser(userId);
    res.json({ products });
  });

  getOne: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const productId = getParam(req, 'productId');
    const product = await this.service.getById(userId, productId);
    res.json({ product });
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const productId = getParam(req, 'productId');
    const body = updateProductBodySchema.parse(req.body);
    const product = await this.service.update(userId, productId, body);
    res.json({ product });
  });

  delete: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const productId = getParam(req, 'productId');
    await this.service.delete(userId, productId);
    res.json({ message: 'Produto deletado com sucesso' });
  });

  uploadImage: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const productId = getParam(req, 'productId');
    const file = req.file!;
    const product = await this.service.uploadProductImage(userId, productId, file);
    res.json({ url: product.image, product });
  });
}
