-- =============================================
-- Luna&Beeds – Kompletná SQL migrácia
-- Spustite v Supabase SQL Editor
-- =============================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (rozšírenie auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- ROLES & ADMIN USERS
-- =============================================
create table if not exists public.roles (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  color text default '#C2185B',
  icon text default '👤',
  description text,
  hierarchy int default 99,
  permissions text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  company_email text not null unique,
  private_email text,
  role_id uuid references public.roles(id),
  created_at timestamptz default now()
);

-- Seed default roles
insert into public.roles (name, color, icon, hierarchy, permissions) values
  ('Vlastník',          '#C2185B', '👑', 1, ARRAY['dashboard','products_read','products_write','orders_read','orders_write','customers_read','payments_read','shipping_write','announcements_write','statistics_read','settings_write','roles_write','users_write']),
  ('Spoluvlastník',     '#880E4F', '🥈', 2, ARRAY['dashboard','products_read','products_write','orders_read','orders_write','customers_read','payments_read','statistics_read','settings_write']),
  ('Manažér',           '#2196F3', '👔', 3, ARRAY['dashboard','products_read','products_write','orders_read','orders_write','customers_read','statistics_read']),
  ('Obchodný manažér',  '#FF9800', '💼', 4, ARRAY['dashboard','products_read','orders_read','orders_write','statistics_read']),
  ('Správa',            '#4CAF50', '🛠️', 5, ARRAY['dashboard','orders_read','orders_write','shipping_write']),
  ('Design',            '#9C27B0', '🎨', 6, ARRAY['dashboard','products_read','products_write']),
  ('QA',                '#00BCD4', '🔍', 7, ARRAY['dashboard','products_read','orders_read'])
on conflict (name) do nothing;

-- =============================================
-- CATEGORIES
-- =============================================
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  color text default '#C2185B',
  parent_id uuid references public.categories(id),
  is_active boolean default true,
  position int default 0,
  created_at timestamptz default now()
);

insert into public.categories (name, slug, icon, color, position, is_active) values
  ('Naramky',        'naramky',        '💎', '#C2185B', 1, true),
  ('Custom Naramky', 'custom-naramky', '✨', '#880E4F', 2, true),
  ('Novinky',        'novinky',        '🌸', '#FF8EC7', 3, true),
  ('Náhrdelníky',    'nahrdelníky',    '💕', '#FFB6D9', 4, true)
on conflict (slug) do nothing;

-- =============================================
-- PRODUCTS
-- =============================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  compare_price numeric(10,2),
  stock int default 0,
  category_id uuid references public.categories(id),
  is_active boolean default true,
  is_featured boolean default false,
  tags text[] default '{}',
  weight numeric(6,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt text,
  position int default 0,
  created_at timestamptz default now()
);

-- Demo products
insert into public.products (name, slug, description, price, compare_price, stock, is_active, is_featured, tags) values
  ('Ružový perličkový naramok', 'ruzovy-perlickovy-naramok', 'Jemný naramok z ružových perličiek, ručne viazaný.', 12.99, 16.99, 15, true, true, ARRAY['naramok','perla','ruzova']),
  ('Biela perličková sada', 'biela-perlickova-sada', 'Elegantná sada bieleho naramku a náhrdelníka.', 24.99, null, 8, true, true, ARRAY['sada','biela','perla']),
  ('Zlatý korálkový naramok', 'zlaty-koralkovy-naramok', 'Luxusný naramok zo zlatých korálikov.', 18.50, 22.00, 20, true, true, ARRAY['naramok','zlatý','luxus'])
on conflict (slug) do nothing;

-- =============================================
-- SHIPPING METHODS
-- =============================================
create table if not exists public.shipping_methods (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  delivery_time text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.shipping_methods (name, description, price, delivery_time, is_active) values
  ('Packeta – výdajné miesto', 'Doručenie na najbližšie výdajné miesto', 2.49, '1-2 pracovné dni', true),
  ('Kuriér – domov',           'Doručenie priamo k vám domov',            3.99, '1-3 pracovné dni', true),
  ('Slovenská pošta',          'Štandardná poštová preprava',             2.99, '2-5 pracovných dní', true),
  ('Doprava zadarmo',          'Pri objednávke nad 50 €',                 0.00, '2-4 pracovné dni', true)
on conflict do nothing;

-- =============================================
-- ORDERS
-- =============================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  status text default 'new' check (status in ('new','processing','paid','shipped','delivered','returned','cancelled')),
  items jsonb default '[]',
  shipping_address jsonb,
  shipping_method_id uuid references public.shipping_methods(id),
  payment_method text check (payment_method in ('stripe','paypal')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal numeric(10,2) default 0,
  shipping_cost numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  note text,
  tracking_number text,
  coupon_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  quantity int not null,
  price numeric(10,2) not null,
  custom_options jsonb,
  created_at timestamptz default now()
);

-- =============================================
-- WISHLIST
-- =============================================
create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- =============================================
-- REVIEWS
-- =============================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating int check (rating between 1 and 5),
  text text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ANNOUNCEMENTS
-- =============================================
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  text text not null,
  icon text,
  color text default '#C2185B',
  type text default 'info' check (type in ('maintenance','news','info','sale','warning')),
  date_from timestamptz,
  date_to timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- CUSTOM MESSAGES
-- =============================================
create table if not exists public.custom_messages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  text text not null,
  icon text,
  color text default '#C2185B',
  priority int default 0,
  date_from timestamptz,
  date_to timestamptz,
  is_active boolean default true,
  show_on_home boolean default true,
  show_in_admin boolean default false,
  show_on_order boolean default false,
  show_on_checkout boolean default false,
  show_on_products boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- COUPONS
-- =============================================
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  type text check (type in ('percentage','fixed')),
  value numeric(10,2) not null,
  min_order numeric(10,2),
  max_uses int,
  uses int default 0,
  date_from timestamptz,
  date_to timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- NEWSLETTER
-- =============================================
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- SETTINGS
-- =============================================
create table if not exists public.settings (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text,
  updated_at timestamptz default now()
);

insert into public.settings (key, value) values
  ('shop_name', 'Luna&Beeds'),
  ('shop_email', 'info@lunabeeds.sk'),
  ('currency', 'EUR'),
  ('free_shipping_from', '50')
on conflict (key) do nothing;

-- =============================================
-- NOTIFICATIONS
-- =============================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  text text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;
alter table public.announcements enable row level security;
alter table public.custom_messages enable row level security;
alter table public.coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;
alter table public.roles enable row level security;
alter table public.admin_users enable row level security;
alter table public.shipping_methods enable row level security;

-- PROFILES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- PRODUCTS – verejné čítanie, admin zápis
create policy "Products are publicly readable" on public.products for select using (is_active = true);
create policy "Admins can manage products" on public.products for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- PRODUCT IMAGES
create policy "Product images are publicly readable" on public.product_images for select using (true);
create policy "Admins can manage product images" on public.product_images for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- CATEGORIES
create policy "Categories are publicly readable" on public.categories for select using (is_active = true);
create policy "Admins can manage categories" on public.categories for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ORDERS
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (true);
create policy "Admins can manage all orders" on public.orders for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- WISHLIST
create policy "Users can manage own wishlist" on public.wishlist for all using (auth.uid() = user_id);

-- REVIEWS
create policy "Approved reviews are public" on public.reviews for select using (is_approved = true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- ANNOUNCEMENTS
create policy "Active announcements are public" on public.announcements for select using (is_active = true);
create policy "Admins can manage announcements" on public.announcements for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- CUSTOM MESSAGES
create policy "Active messages are public" on public.custom_messages for select using (is_active = true);
create policy "Admins can manage messages" on public.custom_messages for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- COUPONS
create policy "Admins can manage coupons" on public.coupons for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- NEWSLETTER
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Admins can view subscribers" on public.newsletter_subscribers for select using (exists (select 1 from public.admin_users where id = auth.uid()));

-- SETTINGS
create policy "Settings are public read" on public.settings for select using (true);
create policy "Admins can manage settings" on public.settings for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- NOTIFICATIONS
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);

-- ROLES
create policy "Roles are publicly readable" on public.roles for select using (true);
create policy "Admins can manage roles" on public.roles for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ADMIN USERS
create policy "Admins can view admin users" on public.admin_users for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Owners can manage admin users" on public.admin_users for all using (
  exists (select 1 from public.admin_users au join public.roles r on au.role_id = r.id where au.id = auth.uid() and r.name = 'Vlastník')
);

-- SHIPPING
create policy "Shipping methods are public" on public.shipping_methods for select using (is_active = true);
create policy "Admins can manage shipping" on public.shipping_methods for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- =============================================
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('category-images', 'category-images', true) on conflict do nothing;

create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins can upload product images" on storage.objects for insert with check (bucket_id = 'product-images' and exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can delete product images" on storage.objects for delete using (bucket_id = 'product-images' and exists (select 1 from public.admin_users where id = auth.uid()));

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
