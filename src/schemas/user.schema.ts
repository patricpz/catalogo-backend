import { z } from 'zod';

export const updateUserProfileBodySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').optional(),
  email: z.string().email('E-mail inválido').optional(),
  phone: z.string().min(8, 'Telefone inválido').optional().nullable(),
  avatar_url: z.string().url('URL do avatar inválida').optional().nullable(),
});

export type UpdateUserProfileBody = z.infer<typeof updateUserProfileBodySchema>;
