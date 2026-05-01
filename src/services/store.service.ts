import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { StoreRepository } from '../repositories/store.repository.js';
import { R2StorageService } from './r2-storage.service.js';
import { extensionForMime } from '../utils/image-file.js';
import { AppError } from '../utils/app-error.js';

type StoreUpdatePayload = {
  name?: string;
  description?: string | null;
  image?: string | null;
  logo_url?: string | null;
  whatsappNumber?: string | null;
  phone_whatsapp?: string | null;
  opening_hours?: Record<string, string>;
  is_open?: boolean;
  primary_color?: string;
  plan_id?: string;
  address?: {
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  };
};

export class StoreService {
  constructor(
    private readonly repo: StoreRepository = new StoreRepository(),
    private readonly storage: R2StorageService = new R2StorageService(),
  ) {}

  /** Cria loja padrão se o utilizador ainda não tiver (registo, login ou primeira chamada autenticada). */
  async ensureDefaultStoreForUser(userId: string, email: string): Promise<void> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) return;
    const local = email.split('@')[0]?.trim() || 'usuario';
    const safe = local.replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'usuario';
    const name = `Loja ${safe}`;
    const slug = `loja-${randomUUID().replace(/-/g, '')}`;
    try {
      await this.repo.create(userId, { name, slug, whatsappNumber: null, planId: 'plan-basico' });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return;
      throw e;
    }
  }

  async create(userId: string, data: { name: string; image?: string | null; whatsappNumber?: string | null; plan_id?: string }) {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new AppError(409, 'Você já possui uma loja', 'STORE_EXISTS');
    }
    const slug = this.generateSlug(data.name);
    return this.repo.create(userId, {
      name: data.name,
      slug,
      image: data.image,
      whatsappNumber: data.whatsappNumber,
      planId: data.plan_id ?? 'plan-basico',
    });
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

  async getById(storeId: string) {
    const store = await this.repo.findByIdWithPlan(storeId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');

    const alerts = this.buildAlerts(store);
    return {
      id: store.id,
      name: store.name,
      description: store.description,
      logo_url: store.logoUrl ?? store.image,
      primary_color: store.primaryColor,
      phone_whatsapp: store.phoneWhatsapp ?? store.whatsappNumber,
      address: {
        logradouro: store.addressLogradouro,
        numero: store.addressNumero,
        complemento: store.addressComplemento,
        bairro: store.addressBairro,
        cidade: store.addressCidade,
        estado: store.addressEstado,
        cep: store.addressCep,
      },
      opening_hours: (store.openingHours ?? {}) as Record<string, string>,
      is_open: store.isOpen,
      plan: {
        id: store.plan.id,
        name: store.plan.name,
        max_products: store.plan.maxProducts,
        used_products: store.productCount,
      },
      alerts,
    };
  }

  async update(userId: string, data: StoreUpdatePayload) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');

    const addressData = await this.resolveAddress(data.address);
    const payload: Prisma.StoreUpdateInput = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.logo_url !== undefined ? { logoUrl: data.logo_url } : {}),
      ...(data.phone_whatsapp !== undefined ? { phoneWhatsapp: data.phone_whatsapp, whatsappNumber: data.phone_whatsapp } : {}),
      ...(data.whatsappNumber !== undefined ? { whatsappNumber: data.whatsappNumber, phoneWhatsapp: data.whatsappNumber } : {}),
      ...(data.opening_hours !== undefined ? { openingHours: data.opening_hours } : {}),
      ...(data.is_open !== undefined ? { isOpen: data.is_open } : {}),
      ...(data.primary_color !== undefined ? { primaryColor: data.primary_color } : {}),
      ...(data.plan_id !== undefined ? { plan: { connect: { id: data.plan_id } } } : {}),
      ...addressData,
    };

    const updated = await this.repo.updateById(store.id, payload);
    await this.recalculateStoreUsage(updated.id);
    return updated;
  }

  async updateHours(userId: string, openingHours: Record<string, string>) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return this.repo.updateById(store.id, { openingHours });
  }

  async updatePrimaryColor(userId: string, primaryColor: string) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return this.repo.updateById(store.id, { primaryColor });
  }

  async getAlerts(storeId: string) {
    const store = await this.repo.findByIdWithPlan(storeId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return this.buildAlerts(store);
  }

  async getPlanUsage(storeId: string) {
    const store = await this.repo.findByIdWithPlan(storeId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    return {
      plan: {
        id: store.plan.id,
        name: store.plan.name,
        max_products: store.plan.maxProducts,
        price: store.plan.price,
      },
      usage: {
        used_products: store.productCount,
        max_products: store.plan.maxProducts,
        over_limit: store.overLimit,
      },
    };
  }

  async assertPlanLimitForProductActivation(storeId: string) {
    const store = await this.repo.findByIdWithPlan(storeId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');
    if (store.productCount >= store.plan.maxProducts) {
      throw new AppError(409, 'Plano atingiu o limite de produtos', 'PLAN_LIMIT_EXCEEDED');
    }
  }

  async recalculateStoreUsage(storeId: string): Promise<void> {
    const store = await this.repo.findByIdWithPlan(storeId);
    if (!store) return;
    const activeCount = await this.repo.countActiveProducts(storeId);
    const overLimit = activeCount > store.plan.maxProducts;
    await this.repo.updateCountersById(storeId, activeCount, overLimit);
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
    return this.repo.update(userId, { image: url, logoUrl: url });
  }

  async uploadStoreLogo(userId: string, file: Express.Multer.File) {
    const store = await this.repo.findByUserId(userId);
    if (!store) throw new AppError(404, 'Loja não encontrada', 'STORE_NOT_FOUND');

    const ext = extensionForMime(file.mimetype);
    const key = `stores/${store.id}/logo/${randomUUID()}.${ext}`;
    const url = await this.storage.uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return this.repo.update(userId, { logoUrl: url, image: url });
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

  private async resolveAddress(address?: StoreUpdatePayload['address']): Promise<Prisma.StoreUpdateInput> {
    if (!address) return {};
    const cep = address.cep?.trim();
    let viaCepData: any = null;

    if (cep && /^\d{8}$/.test(cep)) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.ok) {
          viaCepData = await response.json();
        }
      } catch {
        viaCepData = null;
      }
    }

    return {
      addressLogradouro: address.logradouro ?? viaCepData?.logradouro ?? undefined,
      addressNumero: address.numero ?? undefined,
      addressComplemento: address.complemento ?? viaCepData?.complemento ?? undefined,
      addressBairro: address.bairro ?? viaCepData?.bairro ?? undefined,
      addressCidade: address.cidade ?? viaCepData?.localidade ?? undefined,
      addressEstado: address.estado ?? viaCepData?.uf ?? undefined,
      addressCep: cep ?? undefined,
    };
  }

  private buildAlerts(store: Awaited<ReturnType<StoreRepository['findByIdWithPlan']>>) {
    if (!store) return [];
    const alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'critical' }> = [];
    if (store.overLimit || store.productCount > store.plan.maxProducts) {
      alerts.push({
        type: 'OVER_PRODUCT_LIMIT',
        message: `Você atingiu o limite de produtos do plano ${store.plan.name}.`,
        severity: 'critical',
      });
    }
    if (!store.phoneWhatsapp && !store.whatsappNumber) {
      alerts.push({
        type: 'WHATSAPP_NOT_SET',
        message: 'Defina um número de WhatsApp para receber pedidos.',
        severity: 'warning',
      });
    }
    alerts.push({
      type: 'PLAN_EXPIRING_SOON',
      message: 'Seu plano pode expirar em breve. Verifique a renovação.',
      severity: 'info',
    });
    return alerts;
  }
}
