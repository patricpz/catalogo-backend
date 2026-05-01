import { z } from 'zod';

export const createProductBodySchema = z.object({
  name: z.string().min(1, 'Nome do produto obrigatório'),
  description: z.string().optional().nullable(),
  image: z.string().url('URL da imagem inválida').optional().nullable(),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  available: z.boolean().optional().default(true),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;

export const updateProductBodySchema = createProductBodySchema.partial();
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
