-- =============================================
-- Luna&Beeds - Forum: forum_comments
-- =============================================

create table if not exists public.forum_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  author_id uuid references public.admin_users(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

create index if not exists forum_comments_post_id_idx on public.forum_comments(post_id);
create index if not exists forum_comments_author_id_idx on public.forum_comments(author_id);
