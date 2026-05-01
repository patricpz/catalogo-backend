import { prisma } from '../config/database.js';
import type { Product, ProductStatus } from '@prisma/client';

export class ProductRepository {
  async create(
    storeId: string,
    data: { name: string; description?: string | null; image?: string | null; price: number; available: boolean; status?: ProductStatus },
  ): Promise<Product> {
    return prisma.product.create({ data: { ...data, storeId } });
  }

  async findByStoreId(storeId: string): Promise<Product[]> {
    return prisma.product.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(storeId: string, id: string): Promise<Product | null> {
    return prisma.product.findFirst({ where: { id, storeId } });
  }

  async update(
    storeId: string,
    id: string,
    data: Partial<{ name: string; description?: string | null; image?: string | null; price: number; available: boolean; status: ProductStatus }>,
  ): Promise<Product> {
    const product = await this.findOne(storeId, id);
    if (!product) throw new Error('Produto não encontrado');
    return prisma.product.update({ where: { id }, data });
  }

  async delete(storeId: string, id: string): Promise<Product> {
    const product = await this.findOne(storeId, id);
    if (!product) throw new Error('Produto não encontrado');
    return prisma.product.delete({ where: { id } });
  }
}
