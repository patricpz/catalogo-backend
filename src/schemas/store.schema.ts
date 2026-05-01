import { z } from 'zod';

const whatsappRegex = /^\+[1-9]\d{10,14}$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
const cepRegex = /^\d{8}$/;
const hourRangeRegex = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

const openingHourValueSchema = z
  .string()
  .refine((value) => value === 'fechado' || hourRangeRegex.test(value), 'Horário deve ser HH:MM-HH:MM ou "fechado"');

export const openingHoursSchema = z.object({
  seg: openingHourValueSchema.optional(),
  ter: openingHourValueSchema.optional(),
  qua: openingHourValueSchema.optional(),
  qui: openingHourValueSchema.optional(),
  sex: openingHourValueSchema.optional(),
  sab: openingHourValueSchema.optional(),
  dom: openingHourValueSchema.optional(),
});

export const storeAddressSchema = z.object({
  logradouro: z.string().min(1).optional().nullable(),
  numero: z.string().min(1).optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(1).optional().nullable(),
  cidade: z.string().min(1).optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  cep: z.string().regex(cepRegex, 'CEP deve conter 8 dígitos').optional().nullable(),
});

export const createStoreBodySchema = z.object({
  name: z.string().min(1, 'Nome da loja obrigatório'),
  description: z.string().optional().nullable(),
  logo_url: z.string().url('URL da logo inválida').optional().nullable(),
  image: z.string().url('URL da imagem inválida').optional().nullable(), // compatibilidade
  phone_whatsapp: z
    .string()
    .regex(whatsappRegex, 'Número de WhatsApp inválido')
    .optional()
    .nullable(),
  whatsappNumber: z
    .string()
    .regex(whatsappRegex, 'Número de WhatsApp inválido')
    .optional()
    .nullable(),
  opening_hours: openingHoursSchema.optional(),
  is_open: z.boolean().optional(),
  primary_color: z.string().regex(hexColorRegex, 'Cor primária inválida').optional(),
  plan_id: z.string().min(1, 'Plano obrigatório').optional(),
  address: storeAddressSchema.optional(),
});

export const updateStoreBodySchema = createStoreBodySchema.partial();

export const updateStoreHoursBodySchema = z.object({
  opening_hours: openingHoursSchema,
});

export const updateStoreColorBodySchema = z.object({
  primary_color: z.string().regex(hexColorRegex, 'Cor primária inválida'),
});

export type CreateStoreBody = z.infer<typeof createStoreBodySchema>;
export type UpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
export type OpeningHoursBody = z.infer<typeof updateStoreHoursBodySchema>;
export type StoreAddressBody = z.infer<typeof storeAddressSchema>;
