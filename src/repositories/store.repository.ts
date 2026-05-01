import { prisma } from '../config/database.js';
import { ProductStatus } from '@prisma/client';
import type { Prisma, Store } from '@prisma/client';

const storePlanInclude = {
  plan: true,
} satisfies Prisma.StoreInclude;

export type StoreWithPlan = Prisma.StoreGetPayload<{ include: typeof storePlanInclude }>;

export class StoreRepository {
  async create(
    userId: string,
    data: { name: string; slug: string; image?: string | null; whatsappNumber?: string | null; planId: string },
  ): Promise<Store> {
    return prisma.store.create({
      data: { ...data, userId },
    });
  }

  async findByUserId(userId: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { userId } });
  }

  async findByUserIdWithPlan(userId: string): Promise<StoreWithPlan | null> {
    return prisma.store.findUnique({ where: { userId }, include: storePlanInclude });
  }

  async findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id } });
  }

  async findByIdWithPlan(id: string): Promise<StoreWithPlan | null> {
    return prisma.store.findUnique({ where: { id }, include: storePlanInclude });
  }

  async findBySlugWithProducts(slug: string) {
    return prisma.store.findUnique({
      where: { slug },
      include: {
        plan: true,
        products: {
          where: { status: ProductStatus.ATIVO },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateById(id: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    return prisma.store.update({ where: { id }, data });
  }

  async update(userId: string, data: Prisma.StoreUpdateInput): Promise<Store> {
    const store = await this.findByUserId(userId);
    if (!store) throw new Error('Loja não encontrada');
    return prisma.store.update({ where: { id: store.id }, data });
  }

  async updateCountersById(id: string, productCount: number, overLimit: boolean): Promise<void> {
    await prisma.store.update({
      where: { id },
      data: { productCount, overLimit },
    });
  }

  async countActiveProducts(storeId: string): Promise<number> {
    return prisma.product.count({
      where: { storeId, status: ProductStatus.ATIVO },
    });
  }

  async delete(userId: string): Promise<Store> {
    const store = await this.findByUserId(userId);
    if (!store) throw new Error('Loja não encontrada');
    return prisma.store.delete({ where: { id: store.id } });
  }
}
