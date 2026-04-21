import type { PostgrestError } from '@supabase/supabase-js';
import { AppError } from './app-error.js';

/**
 * Converte erros do PostgREST/Supabase em {@link AppError} com status HTTP coerente.
 */
export function mapSupabaseError(error: PostgrestError): never {
  const message = error.message ?? 'Erro ao acessar o banco de dados';
  const code = error.code ?? 'SUPABASE_ERROR';

  if (code === 'PGRST116') {
    throw new AppError(404, 'Registro não encontrado', 'NOT_FOUND');
  }

  if (code === '23505') {
    throw new AppError(409, message, 'UNIQUE_VIOLATION');
  }

  if (code === '23503') {
    throw new AppError(400, message, 'FK_VIOLATION');
  }

  if (code === '23502') {
    throw new AppError(400, message, 'NOT_NULL_VIOLATION');
  }

  if (code === '42501' || message.toLowerCase().includes('row-level security')) {
    throw new AppError(403, 'Operação bloqueada pelas políticas de segurança (RLS).', 'RLS_VIOLATION');
  }

  console.error('[Supabase]', { code, message, details: error.details, hint: error.hint });
  throw new AppError(400, message, code);
}
