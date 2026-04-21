import { prisma } from '../config/database.js';
import type { Store, Product } from '@prisma/client';

type StoreWithProducts = Store & { products: Product[] };

export class StoreRepository {
  async create(
    userId: string,
    data: { name: string; slug: string; image?: string | null; whatsappNumber?: string | null },
  ): Promise<Store> {
    return prisma.store.create({
      data: { ...data, userId },
    });
  }

  async findByUserId(userId: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { userId } });
  }

  async findBySlugWithProducts(slug: string): Promise<StoreWithProducts | null> {
    return prisma.store.findUnique({
      where: { slug },
      include: { products: true },
    });
  }

  async update(userId: string, data: { name?: string; image?: string | null; whatsappNumber?: string | null }): Promise<Store> {
    const store = await this.findByUserId(userId);
    if (!store) throw new Error('Loja não encontrada');
    return prisma.store.update({ where: { id: store.id }, data });
  }

  async delete(userId: string): Promise<Store> {
    const store = await this.findByUserId(userId);
    if (!store) throw new Error('Loja não encontrada');
    return prisma.store.delete({ where: { id: store.id } });
  }
}
