-- =============================================
-- Luna&Beeds - Forum: forum_posts
-- =============================================
-- author_id odkazuje na auth.users(id), nie admin_users(id) - hoci
-- príspevky vytvárajú iba admin role (vynútené cez RLS v forum_rls.sql),
-- referencia musí byť na auth.users, aby fungovala spoločne s lajkmi
-- a komentármi, ktoré môže vytvoriť aj bežný zákazník.

create table if not exists public.forum_posts (
  id uuid default uuid_generate_v4() primary key,
  forum_id uuid references public.forums(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists forum_posts_forum_id_idx on public.forum_posts(forum_id);
create index if not exists forum_posts_author_id_idx on public.forum_posts(author_id);
create index if not exists forum_posts_created_at_idx on public.forum_posts(created_at desc);

create trigger set_forum_posts_updated_at
  before update on public.forum_posts
  for each row execute procedure public.set_updated_at();
