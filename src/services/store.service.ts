import { randomUUID } from 'node:crypto';
import { StoreRepository } from '../repositories/store.repository.js';
import { R2StorageService } from './r2-storage.service.js';
import { extensionForMime } from '../utils/image-file.js';
import { AppError } from '../utils/app-error.js';

export class StoreService {
  constructor(
    private readonly repo: StoreRepository = new StoreRepository(),
    private readonly storage: R2StorageService = new R2StorageService(),
  ) {}

  async create(userId: string, data: { name: string; image?: string | null; whatsappNumber?: string | null }) {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new AppError(409, 'Você já possui uma loja', 'STORE_EXISTS');
    }
    const slug = this.generateSlug(data.name);
    return this.repo.create(userId, { name: data.name, slug, image: data.image, whatsappNumber: data.whatsappNumber });
  }

  async getByUserId(userId: string) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return store;
  }

  async getBySlug(slug: string) {
    const store = await this.repo.findBySlugWithProducts(slug);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return store;
  }

  async update(userId: string, data: { name?: string; image?: string | null; whatsappNumber?: string | null }) {
    if (data.name) {
      // ensure slug would be unique if name changes
    }
    return this.repo.update(userId, data);
  }

  async uploadStoreImage(userId: string, file: Express.Multer.File) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');

    const ext = extensionForMime(file.mimetype);
    const key = `stores/${store.id}/profile/${randomUUID()}.${ext}`;
    const url = await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return this.repo.update(userId, { image: url });
  }

  async delete(userId: string) {
    return this.repo.delete(userId);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
