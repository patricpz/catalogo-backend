import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z.string().uuid('productId inválido'),
  quantity: z.coerce.number().int().min(1, 'Quantidade mínima: 1'),
});

export const createOrderBodySchema = z.object({
  items: z
    .array(createOrderItemSchema)
    .min(1, 'Pedido deve ter ao menos um item'),
});

export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
