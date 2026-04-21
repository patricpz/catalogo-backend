import { getSupabase } from '../config/supabase.js';
import type { DemoNote } from '../types/supabase-database.types.js';
import { mapSupabaseError } from '../utils/supabase-error.js';
import { AppError } from '../utils/app-error.js';

const TABLE = 'demo_notes' as const;

/**
 * Regras de negócio e acesso à tabela `demo_notes` no Supabase.
 */
export class DemoNoteService {
  async list(): Promise<DemoNote[]> {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      mapSupabaseError(error);
    }
    return data ?? [];
  }

  async getById(id: string): Promise<DemoNote> {
    const { data, error } = await getSupabase().from(TABLE).select('*').eq('id', id).maybeSingle();

    if (error) {
      mapSupabaseError(error);
    }
    if (!data) {
      throw new AppError(404, 'Registro não encontrado', 'NOT_FOUND');
    }
    return data;
  }

  async create(input: { title: string; body?: string | null }): Promise<DemoNote> {
    const { data, error } = await getSupabase().from(TABLE).insert(input).select().single();

    if (error) {
      mapSupabaseError(error);
    }
    if (!data) {
      throw new AppError(500, 'Não foi possível criar o registro', 'CREATE_FAILED');
    }
    return data;
  }

  async update(id: string, patch: { title?: string; body?: string | null }): Promise<DemoNote> {
    const { data, error } = await getSupabase().from(TABLE).update(patch).eq('id', id).select().single();

    if (error) {
      mapSupabaseError(error);
    }
    if (!data) {
      throw new AppError(404, 'Registro não encontrado', 'NOT_FOUND');
    }
    return data;
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await getSupabase().from(TABLE).delete().eq('id', id).select('id').maybeSingle();

    if (error) {
      mapSupabaseError(error);
    }
    if (!data) {
      throw new AppError(404, 'Registro não encontrado', 'NOT_FOUND');
    }
  }
}
