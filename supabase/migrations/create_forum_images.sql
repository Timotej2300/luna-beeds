-- =============================================
-- Luna&Beeds - Forum: forum_images
-- =============================================

create table if not exists public.forum_images (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  url text not null,
  position int default 0,
  created_at timestamptz default now()
);

create index if not exists forum_images_post_id_idx on public.forum_images(post_id);

-- Maximálne 10 obrázkov na prispevok
create or replace function public.check_forum_images_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.forum_images where post_id = new.post_id) >= 10 then
    raise exception 'Maximálny počet obrázkov na prispevok je 10';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_forum_images_limit on public.forum_images;
create trigger enforce_forum_images_limit
  before insert on public.forum_images
  for each row execute procedure public.check_forum_images_limit();
