import type { RequestHandler } from 'express';
import { DemoNoteService } from '../services/demo-note.service.js';
import {
  createDemoNoteBodySchema,
  demoNoteIdParamSchema,
  updateDemoNoteBodySchema,
} from '../schemas/demo-note.schema.js';
import { asyncHandler } from '../utils/async-handler.js';

export class DemoNoteController {
  constructor(private readonly service: DemoNoteService = new DemoNoteService()) {}

  list: RequestHandler = asyncHandler(async (_req, res) => {
    const items = await this.service.list();
    res.json({ items });
  });

  getOne: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = demoNoteIdParamSchema.parse(req.params);
    const item = await this.service.getById(id);
    res.json({ item });
  });

  create: RequestHandler = asyncHandler(async (req, res) => {
    const body = createDemoNoteBodySchema.parse(req.body);
    const item = await this.service.create(body);
    res.status(201).json({ item });
  });

  update: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = demoNoteIdParamSchema.parse(req.params);
    const body = updateDemoNoteBodySchema.parse(req.body);
    const item = await this.service.update(id, body);
    res.json({ item });
  });

  remove: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = demoNoteIdParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  });
}
