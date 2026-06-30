-- =============================================
-- Luna&Beeds - Forum: forum_likes
-- =============================================
-- user_id odkazuje na auth.users(id) - lajkovať môže ktokoľvek
-- prihlásený, vrátane bežných zákazníkov.

create table if not exists public.forum_likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id) -- každý používateľ môže dať iba 1 like na prispevok
);

create index if not exists forum_likes_post_id_idx on public.forum_likes(post_id);
create index if not exists forum_likes_user_id_idx on public.forum_likes(user_id);
