import { z } from 'zod';

export const createDemoNoteBodySchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  body: z.string().optional().nullable(),
});

export type CreateDemoNoteBody = z.infer<typeof createDemoNoteBodySchema>;

export const updateDemoNoteBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    body: z.string().optional().nullable(),
  })
  .refine((data) => data.title !== undefined || data.body !== undefined, {
    message: 'Informe pelo menos title ou body para atualizar',
  });

export type UpdateDemoNoteBody = z.infer<typeof updateDemoNoteBodySchema>;

export const demoNoteIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
