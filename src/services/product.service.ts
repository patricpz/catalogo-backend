import { randomUUID } from 'node:crypto';
import { ProductStatus } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository.js';
import { StoreRepository } from '../repositories/store.repository.js';
import { R2StorageService } from './r2-storage.service.js';
import { extensionForMime } from '../utils/image-file.js';
import { AppError } from '../utils/app-error.js';
import { StoreService } from './store.service.js';

export class ProductService {
  constructor(
    private readonly products: ProductRepository = new ProductRepository(),
    private readonly stores: StoreRepository = new StoreRepository(),
    private readonly storage: R2StorageService = new R2StorageService(),
    private readonly storeService: StoreService = new StoreService(),
  ) {}

  async create(userId: string, data: { name: string; description?: string | null; image?: string | null; price: number; available: boolean }) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    await this.storeService.assertPlanLimitForProductActivation(store.id);
    const product = await this.products.create(store.id, data);
    await this.storeService.recalculateStoreUsage(store.id);
    return product;
  }

  async listByUser(userId: string) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return this.products.findByStoreId(store.id);
  }

  async getById(userId: string, productId: string) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    const product = await this.products.findOne(store.id, productId);
    if (!product) throw new AppError(404, 'Produto não encontrado', 'PRODUCT_NOT_FOUND');
    return product;
  }

  async update(
    userId: string,
    productId: string,
    data: Partial<{ name: string; description?: string | null; image?: string | null; price: number; available: boolean; status: ProductStatus }>,
  ) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    const existing = await this.products.findOne(store.id, productId);
    if (!existing) throw new AppError(404, 'Produto não encontrado', 'PRODUCT_NOT_FOUND');

    const reactivatingByStatus = existing.status === ProductStatus.INATIVO && data.status === ProductStatus.ATIVO;
    const reactivatingByAvailable = existing.available === false && data.available === true;
    if (reactivatingByStatus || reactivatingByAvailable) {
      await this.storeService.assertPlanLimitForProductActivation(store.id);
    }

    const product = await this.products.update(store.id, productId, data);
    await this.storeService.recalculateStoreUsage(store.id);
    return product;
  }

  async delete(userId: string, productId: string) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    const product = await this.products.delete(store.id, productId);
    await this.storeService.recalculateStoreUsage(store.id);
    return product;
  }

  async uploadProductImage(userId: string, productId: string, file: Express.Multer.File) {
    const store = await this.stores.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    const product = await this.products.findOne(store.id, productId);
    if (!product) throw new AppError(404, 'Produto não encontrado', 'PRODUCT_NOT_FOUND');

    const ext = extensionForMime(file.mimetype);
    const key = `stores/${store.id}/products/${productId}/${randomUUID()}.${ext}`;
    const url = await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return this.products.update(store.id, productId, { image: url });
  }
}
