-- Executar no SQL Editor do Supabase (projeto → SQL).
-- Tabela de exemplo para os endpoints /api/supabase/demo-notes

create table if not exists public.demo_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

comment on table public.demo_notes is 'Exemplo CRUD via @supabase/supabase-js no backend';

alter table public.demo_notes enable row level security;

-- ATENÇÃO: política permissiva só para desenvolvimento/demonstração.
-- Em produção, substitua por políticas que restrinjam por usuário/serviço.
create policy "demo_notes_allow_all_anon"
  on public.demo_notes
  for all
  to anon
  using (true)
  with check (true);
