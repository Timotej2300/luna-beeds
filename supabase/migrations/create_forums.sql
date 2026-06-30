-- =============================================
-- Luna&Beeds - Forum: forums (kategórie/sekcie)
-- =============================================
-- Fórum (napr. "Novinky", "Návrhy produktov") vytvárajú iba admin role
-- (pozri forum_rls.sql), ale vidieť a čítať ho môže každý prihlásený
-- používateľ vrátane bežných zákazníkov.

create table if not exists public.forums (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text default '💬',
  created_by uuid references auth.users(id) on delete set null not null,
  created_at timestamptz default now()
);

create index if not exists forums_created_by_idx on public.forums(created_by);
create index if not exists forums_created_at_idx on public.forums(created_at desc);
