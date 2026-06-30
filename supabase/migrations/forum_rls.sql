-- =============================================
-- Luna&Beeds - Forum: role, RPC funkcie, RLS, storage, realtime
-- =============================================

-- ---------------------------------------------
-- 1) Doplnenie role "Správa Webu"
-- ---------------------------------------------
-- V pôvodnom seede (public.roles) táto rola chýbala. Má plné práva
-- (rovnocenné Vlastníkovi) v rámci Fóra - pozri funkciu has_full_forum_access().
insert into public.roles (name, color, icon, hierarchy, permissions)
values ('Správa Webu', '#C2185B', '💼', 2, ARRAY['dashboard','products_read','products_write','orders_read','orders_write','customers_read','payments_read','shipping_write','announcements_write','statistics_read','settings_write','roles_write','users_write'])
on conflict (name) do nothing;

-- ---------------------------------------------
-- 2) Pomocné funkcie pre kontrolu prístupu
-- ---------------------------------------------

-- Rola prihláseného používateľa (null pre bežného zákazníka bez admin_users záznamu)
create or replace function public.current_forum_role()
returns text language sql security definer stable as $$
  select r.name
  from public.admin_users au
  join public.roles r on au.role_id = r.id
  where au.id = auth.uid();
$$;

-- Vytvárať FÓRA a PRÍSPEVKY môžu všetky admin role (8 rolí)
create or replace function public.can_create_forum_content()
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on au.role_id = r.id
    where au.id = auth.uid()
      and r.name in (
        'Vlastník', 'Spoluvlastník', 'Správa', 'Správa Webu',
        'Manažér', 'Obchodný manažér', 'QA', 'Design'
      )
  );
$$;

-- Plné práva (upraviť/zmazať čokoľvek) majú iba Vlastník a Správa Webu
create or replace function public.has_full_forum_access()
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from public.admin_users au
    join public.roles r on au.role_id = r.id
    where au.id = auth.uid()
      and r.name in ('Vlastník', 'Správa Webu')
  );
$$;

-- ---------------------------------------------
-- 3) Funkcia pre autorov (zjednocuje admin_users a profiles)
-- ---------------------------------------------
-- Príspevky vytvárajú len admin role, ale komentovať/lajkovať môže
-- aj bežný zákazník - táto funkcia dotiahne meno a rolu (ak existuje)
-- pre KAŽDÉHO prihláseného používateľa, autora príspevku či komentára.
--
-- POZOR: musí byť SECURITY DEFINER, pretože public.profiles má RLS
-- politiku "auth.uid() = id" (každý vidí iba svoj profil) - bežné view
-- by preto pri čítaní cudzích mien (autorov iných príspevkov/komentárov)
-- vrátilo prázdne riadky. Funkcia obchádza RLS bezpečne, pretože vracia
-- iba meno, priezvisko a rolu - žiadne citlivé údaje.

create or replace function public.get_forum_authors(author_ids uuid[])
returns table (
  id uuid,
  first_name text,
  last_name text,
  role_name text,
  role_color text,
  role_icon text
)
language sql security definer stable as $$
  select au.id, au.first_name, au.last_name, r.name, r.color, r.icon
  from public.admin_users au
  left join public.roles r on au.role_id = r.id
  where au.id = any(author_ids)
  union all
  select p.id, p.first_name, p.last_name, null, null, null
  from public.profiles p
  where p.id = any(author_ids)
    and not exists (select 1 from public.admin_users au where au.id = p.id);
$$;

grant execute on function public.get_forum_authors(uuid[]) to authenticated;

-- ---------------------------------------------
-- 4) Row Level Security
-- ---------------------------------------------

alter table public.forums enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_images enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_likes enable row level security;

-- FORUMS
-- Čítať môže každý prihlásený používateľ (admin aj zákazník)
drop policy if exists "Forum: prihlásení čítajú zoznam fór" on public.forums;
create policy "Forum: prihlásení čítajú zoznam fór"
  on public.forums for select
  using (auth.uid() is not null);

-- Vytvárať môžu iba admin role
drop policy if exists "Forum: admin role vytvárajú fóra" on public.forums;
create policy "Forum: admin role vytvárajú fóra"
  on public.forums for insert
  with check (public.can_create_forum_content() and created_by = auth.uid());

-- Upravovať/mazať fóra môžu iba Vlastník a Správa Webu
drop policy if exists "Forum: plný prístup upravuje fóra" on public.forums;
create policy "Forum: plný prístup upravuje fóra"
  on public.forums for update
  using (public.has_full_forum_access());

drop policy if exists "Forum: plný prístup maže fóra" on public.forums;
create policy "Forum: plný prístup maže fóra"
  on public.forums for delete
  using (public.has_full_forum_access());

-- FORUM_POSTS
-- Čítať môže každý prihlásený používateľ
drop policy if exists "Forum: prihlásení čítajú prispevky" on public.forum_posts;
create policy "Forum: prihlásení čítajú prispevky"
  on public.forum_posts for select
  using (auth.uid() is not null);

-- Vytvárať prispevky môžu iba admin role
drop policy if exists "Forum: admin role vytvárajú prispevky" on public.forum_posts;
create policy "Forum: admin role vytvárajú prispevky"
  on public.forum_posts for insert
  with check (public.can_create_forum_content() and author_id = auth.uid());

-- Upraviť/zmazať: autor svoj vlastný, alebo Vlastník/Správa Webu čokoľvek
drop policy if exists "Forum: autor alebo plný prístup upravuje prispevok" on public.forum_posts;
create policy "Forum: autor alebo plný prístup upravuje prispevok"
  on public.forum_posts for update
  using (author_id = auth.uid() or public.has_full_forum_access());

drop policy if exists "Forum: autor alebo plný prístup maže prispevok" on public.forum_posts;
create policy "Forum: autor alebo plný prístup maže prispevok"
  on public.forum_posts for delete
  using (author_id = auth.uid() or public.has_full_forum_access());

-- FORUM_IMAGES
drop policy if exists "Forum: prihlásení čítajú obrázky" on public.forum_images;
create policy "Forum: prihlásení čítajú obrázky"
  on public.forum_images for select
  using (auth.uid() is not null);

drop policy if exists "Forum: autor prispevku pridáva obrázky" on public.forum_images;
create policy "Forum: autor prispevku pridáva obrázky"
  on public.forum_images for insert
  with check (
    exists (
      select 1 from public.forum_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.has_full_forum_access())
    )
  );

drop policy if exists "Forum: autor prispevku maže obrázky" on public.forum_images;
create policy "Forum: autor prispevku maže obrázky"
  on public.forum_images for delete
  using (
    exists (
      select 1 from public.forum_posts p
      where p.id = post_id and (p.author_id = auth.uid() or public.has_full_forum_access())
    )
  );

-- FORUM_COMMENTS
-- Čítať a pridávať komentáre môže každý prihlásený používateľ
drop policy if exists "Forum: prihlásení čítajú komentáre" on public.forum_comments;
create policy "Forum: prihlásení čítajú komentáre"
  on public.forum_comments for select
  using (auth.uid() is not null);

drop policy if exists "Forum: prihlásení pridávajú komentáre" on public.forum_comments;
create policy "Forum: prihlásení pridávajú komentáre"
  on public.forum_comments for insert
  with check (auth.uid() is not null and author_id = auth.uid());

-- Upraviť/zmazať: autor svoj vlastný, alebo Vlastník/Správa Webu čokoľvek
drop policy if exists "Forum: autor alebo plný prístup upravuje komentár" on public.forum_comments;
create policy "Forum: autor alebo plný prístup upravuje komentár"
  on public.forum_comments for update
  using (author_id = auth.uid() or public.has_full_forum_access());

drop policy if exists "Forum: autor alebo plný prístup maže komentár" on public.forum_comments;
create policy "Forum: autor alebo plný prístup maže komentár"
  on public.forum_comments for delete
  using (author_id = auth.uid() or public.has_full_forum_access());

-- FORUM_LIKES
-- Lajkovať môže každý prihlásený používateľ, vlastný like
drop policy if exists "Forum: prihlásení čítajú lajky" on public.forum_likes;
create policy "Forum: prihlásení čítajú lajky"
  on public.forum_likes for select
  using (auth.uid() is not null);

drop policy if exists "Forum: používateľ dáva vlastný like" on public.forum_likes;
create policy "Forum: používateľ dáva vlastný like"
  on public.forum_likes for insert
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Forum: používateľ odoberá vlastný like" on public.forum_likes;
create policy "Forum: používateľ odoberá vlastný like"
  on public.forum_likes for delete
  using (user_id = auth.uid());

-- ---------------------------------------------
-- 5) Supabase Storage - bucket pre obrázky fóra
-- ---------------------------------------------

insert into storage.buckets (id, name, public)
values ('forum-images', 'forum-images', true)
on conflict do nothing;

drop policy if exists "Forum: verejné čítanie obrázkov fóra" on storage.objects;
create policy "Forum: verejné čítanie obrázkov fóra"
  on storage.objects for select
  using (bucket_id = 'forum-images');

drop policy if exists "Forum: admin role nahrávajú obrázky" on storage.objects;
create policy "Forum: admin role nahrávajú obrázky"
  on storage.objects for insert
  with check (bucket_id = 'forum-images' and public.can_create_forum_content());

drop policy if exists "Forum: admin role mažú obrázky" on storage.objects;
create policy "Forum: admin role mažú obrázky"
  on storage.objects for delete
  using (bucket_id = 'forum-images' and (public.can_create_forum_content() or public.has_full_forum_access()));

-- ---------------------------------------------
-- 6) Realtime publikácia
-- ---------------------------------------------

alter publication supabase_realtime add table public.forums;
alter publication supabase_realtime add table public.forum_posts;
alter publication supabase_realtime add table public.forum_comments;
alter publication supabase_realtime add table public.forum_likes;
