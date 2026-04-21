import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-database.types.js';
import { AppError } from '../utils/app-error.js';

let client: SupabaseClient<Database> | null = null;

/**
 * Cliente Supabase singleton (sem sessão persistente — adequado ao backend).
 * Exige `SUPABASE_URL` e `SUPABASE_ANON_KEY` no ambiente.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new AppError(
      503,
      'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.',
      'SUPABASE_NOT_CONFIGURED',
    );
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}
