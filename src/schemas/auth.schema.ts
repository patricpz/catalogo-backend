import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.string().email('E-mail inválido').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128, 'Senha muito longa'),
});

export const loginBodySchema = z.object({
  email: z.string().email('E-mail inválido').transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
