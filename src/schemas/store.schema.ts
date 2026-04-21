import { z } from 'zod';

export const createStoreBodySchema = z.object({
  name: z.string().min(1, 'Nome da loja obrigatório'),
  image: z.string().url('URL da imagem inválida').optional().nullable(),
  whatsappNumber: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Número de WhatsApp inválido')
    .optional()
    .nullable(),
});

export const updateStoreBodySchema = createStoreBodySchema.partial();

export type CreateStoreBody = z.infer<typeof createStoreBodySchema>;
export type UpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
