-- =============================================
-- Luna&Beeds - Forum: role, RLS, storage, realtime
-- =============================================

-- ---------------------------------------------
-- 1) Doplnenie rolí potrebných pre prístup do Fóra
-- ---------------------------------------------
-- V existujúcom seede (public.roles) sa "Designer" volá "Design" a "Sprava" sa
-- volá "Správa" - tie už majú prístup. "Sprava Fora" je nová rola len pre Fórum.
insert into public.roles (name, color, icon, hierarchy, permissions)
values ('Správa Fóra', '#C2185B', '🗂️', 8, ARRAY['dashboard', 'forum_read', 'forum_write', 'forum_moderate'])
on conflict (name) do nothing;

-- ---------------------------------------------
-- 2) Pomocné funkcie pre kontrolu prístupu
-- ---------------------------------------------

-- Vráti true, ak je prihlásený používateľ Vlastník
create or replace function public.is_forum_owner()
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on au.role_id = r.id
    where au.id = auth.uid() and r.name = 'Vlastník'
  );
$$;

-- Vráti true, ak má prihlásený používateľ prístup do Fóra
-- (Vlastník, Design, Správa, Správa Fóra)
create or replace function public.has_forum_access()
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on au.role_id = r.id
    where au.id = auth.uid()
      and r.name in ('Vlastník', 'Design', 'Správa', 'Správa Fóra')
  );
$$;

-- ---------------------------------------------
-- 3) Row Level Security
-- ---------------------------------------------

alter table public.forum_posts enable row level security;
alter table public.forum_images enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_likes enable row level security;

-- FORUM_POSTS
drop policy if exists "Forum: povolené role môžu čítať prispevky" on public.forum_posts;
create policy "Forum: povolené role môžu čítať prispevky"
  on public.forum_posts for select
  using (public.has_forum_access());

drop policy if exists "Forum: povolené role môžu vytvárať prispevky" on public.forum_posts;
create policy "Forum: povolené role môžu vytvárať prispevky"
  on public.forum_posts for insert
  with check (public.has_forum_access() and author_id = auth.uid());

drop policy if exists "Forum: autor upravuje svoj prispevok" on public.forum_posts;
create policy "Forum: autor upravuje svoj prispevok"
  on public.forum_posts for update
  using (public.has_forum_access() and (author_id = auth.uid() or public.is_forum_owner()));

drop policy if exists "Forum: autor maze svoj prispevok" on public.forum_posts;
create policy "Forum: autor maze svoj prispevok"
  on public.forum_posts for delete
  using (public.has_forum_access() and (author_id = auth.uid() or public.is_forum_owner()));

-- FORUM_IMAGES
drop policy if exists "Forum: povolené role čítajú obrázky" on public.forum_images;
create policy "Forum: povolené role čítajú obrázky"
  on public.forum_images for select
  using (public.has_forum_access());

drop policy if exists "Forum: autor prispevku pridáva obrázky" on public.forum_images;
create policy "Forum: autor prispevku pridáva obrázky"
  on public.forum_images for insert
  with check (
    public.has_forum_access()
    and exists (
      select 1 from public.forum_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.is_forum_owner())
    )
  );

drop policy if exists "Forum: autor prispevku maze obrázky" on public.forum_images;
create policy "Forum: autor prispevku maze obrázky"
  on public.forum_images for delete
  using (
    public.has_forum_access()
    and exists (
      select 1 from public.forum_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.is_forum_owner())
    )
  );

-- FORUM_COMMENTS
drop policy if exists "Forum: povolené role čítajú komentáre" on public.forum_comments;
create policy "Forum: povolené role čítajú komentáre"
  on public.forum_comments for select
  using (public.has_forum_access());

drop policy if exists "Forum: povolené role pridávajú komentáre" on public.forum_comments;
create policy "Forum: povolené role pridávajú komentáre"
  on public.forum_comments for insert
  with check (public.has_forum_access() and author_id = auth.uid());

drop policy if exists "Forum: autor maze svoj komentár, Vlastník akýkolvek" on public.forum_comments;
create policy "Forum: autor maze svoj komentár, Vlastník akýkolvek"
  on public.forum_comments for delete
  using (public.has_forum_access() and (author_id = auth.uid() or public.is_forum_owner()));

drop policy if exists "Forum: autor upravuje svoj komentár, Vlastník akýkolvek" on public.forum_comments;
create policy "Forum: autor upravuje svoj komentár, Vlastník akýkolvek"
  on public.forum_comments for update
  using (public.has_forum_access() and (author_id = auth.uid() or public.is_forum_owner()));

-- FORUM_LIKES
drop policy if exists "Forum: povolené role čítajú lajky" on public.forum_likes;
create policy "Forum: povolené role čítajú lajky"
  on public.forum_likes for select
  using (public.has_forum_access());

drop policy if exists "Forum: používateľ dáva vlastný like" on public.forum_likes;
create policy "Forum: používateľ dáva vlastný like"
  on public.forum_likes for insert
  with check (public.has_forum_access() and user_id = auth.uid());

drop policy if exists "Forum: používateľ odoberá vlastný like" on public.forum_likes;
create policy "Forum: používateľ odoberá vlastný like"
  on public.forum_likes for delete
  using (public.has_forum_access() and user_id = auth.uid());

-- ---------------------------------------------
-- 4) Supabase Storage - bucket pre obrázky fóra
-- ---------------------------------------------

insert into storage.buckets (id, name, public)
values ('forum-images', 'forum-images', true)
on conflict do nothing;

drop policy if exists "Forum: verejné čítanie obrázkov fóra" on storage.objects;
create policy "Forum: verejné čítanie obrázkov fóra"
  on storage.objects for select
  using (bucket_id = 'forum-images');

drop policy if exists "Forum: povolené role nahrávajú obrázky" on storage.objects;
create policy "Forum: povolené role nahrávajú obrázky"
  on storage.objects for insert
  with check (bucket_id = 'forum-images' and public.has_forum_access());

drop policy if exists "Forum: povolené role mazú obrázky" on storage.objects;
create policy "Forum: povolené role mazú obrázky"
  on storage.objects for delete
  using (bucket_id = 'forum-images' and public.has_forum_access());

-- ---------------------------------------------
-- 5) Realtime publikácia
-- ---------------------------------------------

alter publication supabase_realtime add table public.forum_posts;
alter publication supabase_realtime add table public.forum_comments;
alter publication supabase_realtime add table public.forum_likes;
