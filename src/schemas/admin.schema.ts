import { z } from 'zod';

const positiveInt = z.coerce.number().int().min(1);

export const paginationSchema = z.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
});

export const adminStoresQuerySchema = paginationSchema.extend({
  status: z.enum(['Ativa', 'Inativa', 'Pendente', 'Bloqueada']).optional(),
  search: z.string().trim().optional(),
});

export const adminUsersQuerySchema = paginationSchema.extend({
  tipo: z.enum(['Cliente', 'Lojista', 'Admin']).optional(),
  status: z.enum(['Ativo', 'Inativo', 'Bloqueado', 'Pendente']).optional(),
  search: z.string().trim().optional(),
});

export const adminOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(['Aguardando', 'Em andamento', 'Entregue', 'Cancelado']).optional(),
  search: z.string().trim().optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
});

export const adminCatalogsQuerySchema = z.object({
  search: z.string().trim().optional(),
  loja_id: z.string().trim().optional(),
});

export const adminProductsQuerySchema = paginationSchema.extend({
  loja_id: z.string().trim().optional(),
  categoria: z.string().trim().optional(),
  status: z.enum(['Ativo', 'Inativo']).optional(),
  search: z.string().trim().optional(),
});

export const updateStoreStatusSchema = z.object({
  status: z.enum(['Ativa', 'Inativa', 'Bloqueada']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['Ativo', 'Bloqueado', 'Inativo']),
});

export const updateCatalogStatusSchema = z.object({
  status: z.enum(['Publicado', 'Pausado']),
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['Ativo', 'Inativo']),
});
