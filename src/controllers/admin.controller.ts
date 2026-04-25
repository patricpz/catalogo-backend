import type { RequestHandler } from 'express';
import { AdminService } from '../services/admin.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  adminCatalogsQuerySchema,
  adminOrdersQuerySchema,
  adminProductsQuerySchema,
  adminStoresQuerySchema,
  adminUsersQuerySchema,
  updateCatalogStatusSchema,
  updateProductStatusSchema,
  updateStoreStatusSchema,
  updateUserStatusSchema,
} from '../schemas/admin.schema.js';

export class AdminController {
  constructor(private readonly service: AdminService = new AdminService()) {}

  private getParam(value: string | string[] | undefined): string {
    if (!value) return '';
    return Array.isArray(value) ? value[0] : value;
  }

  dashboard: RequestHandler = asyncHandler(async (_req, res) => {
    const result = await this.service.getDashboard();
    res.json(result);
  });

  listStores: RequestHandler = asyncHandler(async (req, res) => {
    const query = adminStoresQuerySchema.parse(req.query);
    res.json(await this.service.listStores(query));
  });

  getStoreById: RequestHandler = asyncHandler(async (req, res) => {
    res.json(await this.service.getStoreById(this.getParam(req.params.id)));
  });

  updateStoreStatus: RequestHandler = asyncHandler(async (req, res) => {
    const body = updateStoreStatusSchema.parse(req.body);
    const actorUserId = req.auth!.sub;
    res.json(await this.service.updateStoreStatus(actorUserId, this.getParam(req.params.id), body.status));
  });

  listUsers: RequestHandler = asyncHandler(async (req, res) => {
    const query = adminUsersQuerySchema.parse(req.query);
    res.json(await this.service.listUsers(query));
  });

  updateUserStatus: RequestHandler = asyncHandler(async (req, res) => {
    const body = updateUserStatusSchema.parse(req.body);
    const actorUserId = req.auth!.sub;
    res.json(await this.service.updateUserStatus(actorUserId, this.getParam(req.params.id), body.status));
  });

  listOrders: RequestHandler = asyncHandler(async (req, res) => {
    const query = adminOrdersQuerySchema.parse(req.query);
    res.json(await this.service.listOrders(query));
  });

  getOrderById: RequestHandler = asyncHandler(async (req, res) => {
    res.json(await this.service.getOrderById(this.getParam(req.params.id)));
  });

  listCatalogs: RequestHandler = asyncHandler(async (req, res) => {
    const query = adminCatalogsQuerySchema.parse(req.query);
    res.json(await this.service.listCatalogs(query));
  });

  updateCatalogStatus: RequestHandler = asyncHandler(async (req, res) => {
    const body = updateCatalogStatusSchema.parse(req.body);
    const actorUserId = req.auth!.sub;
    res.json(await this.service.updateCatalogStatus(actorUserId, this.getParam(req.params.id), body.status));
  });

  listProducts: RequestHandler = asyncHandler(async (req, res) => {
    const query = adminProductsQuerySchema.parse(req.query);
    res.json(await this.service.listProducts(query));
  });

  updateProductStatus: RequestHandler = asyncHandler(async (req, res) => {
    const body = updateProductStatusSchema.parse(req.body);
    const actorUserId = req.auth!.sub;
    res.json(await this.service.updateProductStatus(actorUserId, this.getParam(req.params.id), body.status));
  });

  deleteProduct: RequestHandler = asyncHandler(async (req, res) => {
    const actorUserId = req.auth!.sub;
    res.json(await this.service.deleteProduct(actorUserId, this.getParam(req.params.id)));
  });
}
