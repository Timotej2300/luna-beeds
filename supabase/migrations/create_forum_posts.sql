-- =============================================
-- Luna&Beeds - Forum: forum_posts
-- =============================================

create table if not exists public.forum_posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.admin_users(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists forum_posts_author_id_idx on public.forum_posts(author_id);
create index if not exists forum_posts_created_at_idx on public.forum_posts(created_at desc);

create trigger set_forum_posts_updated_at
  before update on public.forum_posts
  for each row execute procedure public.set_updated_at();
