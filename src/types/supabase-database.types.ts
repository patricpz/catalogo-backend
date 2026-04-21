/**
 * Tipagem mínima do schema `public` no Supabase para o cliente tipado.
 * Amplie conforme novas tabelas forem criadas (ou gere com `supabase gen types`).
 */
export type DemoNote = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      demo_notes: {
        Row: DemoNote;
        Insert: {
          id?: string;
          title: string;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          body?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
