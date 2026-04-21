import type { RequestHandler } from 'express';
import { OrderService } from '../services/order.service.js';
import { createOrderBodySchema } from '../schemas/order.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export class OrderController {
  constructor(private readonly service: OrderService = new OrderService()) {}

  create: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const body = createOrderBodySchema.parse(req.body);
    const order = await this.service.create(userId, body.items);
    res.status(201).json({ order });
  });

  listByUser: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.auth!.sub;
    const orders = await this.service.listByUser(userId);
    res.json({ orders });
  });
}
