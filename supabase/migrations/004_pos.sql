-- =============================================
-- Luna&Beeds – POS modul migrácia
-- =============================================

-- STORES (predajne)
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  address text,
  city text,
  phone text,
  email text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STORE USERS (priradenie predajcov k predajni)
create table if not exists public.store_users (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(store_id, user_id)
);

-- STORE INVENTORY (sklad predajne)
create table if not exists public.store_inventory (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  stock int default 0,
  updated_at timestamptz default now(),
  unique(store_id, product_id)
);

-- POS SALES (predaje z pokladne)
create table if not exists public.pos_sales (
  id uuid default uuid_generate_v4() primary key,
  sale_number text not null unique,
  store_id uuid references public.stores(id) not null,
  seller_id uuid references auth.users(id) not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text default 'cash' check (payment_method in ('cash','card','other')),
  amount_paid numeric(10,2) not null,
  change_given numeric(10,2) default 0,
  coupon_id uuid references public.coupons(id),
  coupon_code text,
  coupon_discount numeric(10,2) default 0,
  customer_email text,
  note text,
  idempotency_key text unique,
  created_at timestamptz default now()
);

-- POS SALE ITEMS (položky predaja)
create table if not exists public.pos_sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.pos_sales(id) on delete cascade not null,
  type text default 'product' check (type in ('product','custom')),
  product_id uuid references public.products(id),
  name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null,
  created_at timestamptz default now()
);

-- STORE ORDERS (objednávky/rezervácie na predajňu)
create table if not exists public.store_orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  store_id uuid references public.stores(id) not null,
  seller_id uuid references auth.users(id) not null,
  product_id uuid references public.products(id) not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  contact_via text[] default '{}',
  note text,
  status text default 'pending' check (status in ('pending','ordered','in_transit','ready','contacted','picked_up','cancelled')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid','paid')),
  pos_sale_id uuid references public.pos_sales(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- COUPON USAGES (história použitia kupónov)
create table if not exists public.coupon_usages (
  id uuid default uuid_generate_v4() primary key,
  coupon_id uuid references public.coupons(id) not null,
  channel text not null check (channel in ('ecommerce','pos')),
  sale_id uuid references public.pos_sales(id),
  order_id uuid references public.orders(id),
  store_id uuid references public.stores(id),
  seller_id uuid references auth.users(id),
  original_total numeric(10,2) not null,
  discount numeric(10,2) not null,
  final_total numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Pridaj channel do coupons (POS / ecommerce / all)
alter table public.coupons
  add column if not exists channel text default 'all' check (channel in ('all','ecommerce','pos'));

-- Pridaj updated_at do stores
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_stores_updated_at before update on public.stores for each row execute procedure public.set_updated_at();
create trigger set_store_inventory_updated_at before update on public.store_inventory for each row execute procedure public.set_updated_at();
create trigger set_store_orders_updated_at before update on public.store_orders for each row execute procedure public.set_updated_at();

-- Pridaj POS permissions do existujúcich rolí
update public.roles
set permissions = array_append(permissions, 'pos_access')
where name in ('Vlastník', 'Spoluvlastník', 'Manažér', 'Obchodný manažér', 'Správa');

update public.roles
set permissions = array_append(permissions, 'pos_sales')
where name in ('Vlastník', 'Spoluvlastník', 'Manažér', 'Obchodný manažér', 'Správa');

update public.roles
set permissions = array_append(permissions, 'pos_store_orders')
where name in ('Vlastník', 'Spoluvlastník', 'Manažér', 'Obchodný manažér', 'Správa');

update public.roles
set permissions = array_append(permissions, 'pos_manage_stores')
where name in ('Vlastník', 'Spoluvlastník');

-- Demo predajňa
insert into public.stores (name, slug, address, city, phone, email, is_active) values
  ('Predajňa Spišská Belá', 'spiska-bela', 'Hlavná 1', 'Spišská Belá', '+421 900 000 000', 'predajna@lunabeeds.sk', true)
on conflict (slug) do nothing;

-- =============================================
-- RLS POLICIES
-- =============================================
alter table public.stores enable row level security;
alter table public.store_users enable row level security;
alter table public.store_inventory enable row level security;
alter table public.pos_sales enable row level security;
alter table public.pos_sale_items enable row level security;
alter table public.store_orders enable row level security;
alter table public.coupon_usages enable row level security;

-- STORES
create policy "Stores readable by admins" on public.stores
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can manage stores" on public.stores
  for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- STORE USERS
create policy "Store users readable by admins" on public.store_users
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can manage store users" on public.store_users
  for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- STORE INVENTORY
create policy "Inventory readable by admins" on public.store_inventory
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can manage inventory" on public.store_inventory
  for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- POS SALES – predajca vidí len svoje, admin vidí všetky
create policy "Sellers can view own sales" on public.pos_sales
  for select using (auth.uid() = seller_id or exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Sellers can create sales" on public.pos_sales
  for insert with check (auth.uid() = seller_id and exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can manage all sales" on public.pos_sales
  for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- POS SALE ITEMS
create policy "Sale items readable by admins" on public.pos_sale_items
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Sale items insertable by admins" on public.pos_sale_items
  for insert with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- STORE ORDERS
create policy "Store orders readable by admins" on public.store_orders
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can manage store orders" on public.store_orders
  for all using (exists (select 1 from public.admin_users where id = auth.uid()));

-- COUPON USAGES
create policy "Coupon usages readable by admins" on public.coupon_usages
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));
create policy "Admins can insert coupon usages" on public.coupon_usages
  for insert with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- =============================================
-- RPC: create_pos_sale (atomická transakcia)
-- =============================================
create or replace function public.create_pos_sale(
  p_store_id uuid,
  p_seller_id uuid,
  p_items jsonb,
  p_payment_method text,
  p_amount_paid numeric,
  p_coupon_id uuid,
  p_coupon_code text,
  p_coupon_discount numeric,
  p_customer_email text,
  p_note text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_sale_number text;
  v_subtotal numeric := 0;
  v_total numeric;
  v_change numeric;
  v_item jsonb;
  v_product record;
  v_inv record;
  v_year text := to_char(now(), 'YYYY');
  v_seq int;
begin
  -- Idempotency check
  if p_idempotency_key is not null then
    select id into v_sale_id from public.pos_sales where idempotency_key = p_idempotency_key;
    if found then
      return jsonb_build_object('sale_id', v_sale_id, 'duplicate', true);
    end if;
  end if;

  -- Vypočítaj subtotal a over produkty
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if (v_item->>'type') = 'product' then
      select * into v_product from public.products where id = (v_item->>'product_id')::uuid and is_active = true;
      if not found then
        raise exception 'Produkt % neexistuje alebo nie je aktívny', v_item->>'product_id';
      end if;
      -- Over sklad predajne
      select * into v_inv from public.store_inventory
        where store_id = p_store_id and product_id = (v_item->>'product_id')::uuid;
      if found and v_inv.stock < (v_item->>'quantity')::int then
        raise exception 'Nedostatok skladu pre %', v_product.name;
      end if;
      -- Over cenu server-side
      if abs(v_product.price - (v_item->>'unit_price')::numeric) > 0.01 then
        raise exception 'Neplatná cena pre %', v_product.name;
      end if;
    end if;
    v_subtotal := v_subtotal + (v_item->>'total')::numeric;
  end loop;

  v_total := v_subtotal - p_coupon_discount;
  v_change := p_amount_paid - v_total;

  -- Generuj sale_number
  select coalesce(max(substring(sale_number from 9)::int), 0) + 1 into v_seq
    from public.pos_sales where sale_number like 'SALE-' || v_year || '-%';
  v_sale_number := 'SALE-' || v_year || '-' || lpad(v_seq::text, 6, '0');

  -- Vytvor sale
  insert into public.pos_sales (
    sale_number, store_id, seller_id, subtotal, discount, total,
    payment_method, amount_paid, change_given,
    coupon_id, coupon_code, coupon_discount,
    customer_email, note, idempotency_key
  ) values (
    v_sale_number, p_store_id, p_seller_id, v_subtotal, p_coupon_discount, v_total,
    p_payment_method, p_amount_paid, v_change,
    p_coupon_id, p_coupon_code, p_coupon_discount,
    p_customer_email, p_note, p_idempotency_key
  ) returning id into v_sale_id;

  -- Vytvor sale items + aktualizuj sklad
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.pos_sale_items (
      sale_id, type, product_id, name, quantity, unit_price, total
    ) values (
      v_sale_id,
      coalesce(v_item->>'type', 'product'),
      case when (v_item->>'type') = 'product' then (v_item->>'product_id')::uuid else null end,
      v_item->>'name',
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'total')::numeric
    );

    -- Odpočítaj sklad predajne (len pre produkty)
    if (v_item->>'type') = 'product' then
      update public.store_inventory
        set stock = stock - (v_item->>'quantity')::int
        where store_id = p_store_id and product_id = (v_item->>'product_id')::uuid;
    end if;
  end loop;

  -- Zaznamenaj použitie kupónu
  if p_coupon_id is not null then
    insert into public.coupon_usages (
      coupon_id, channel, sale_id, store_id, seller_id,
      original_total, discount, final_total
    ) values (
      p_coupon_id, 'pos', v_sale_id, p_store_id, p_seller_id,
      v_subtotal, p_coupon_discount, v_total
    );
    update public.coupons set uses = uses + 1 where id = p_coupon_id;
  end if;

  return jsonb_build_object(
    'sale_id', v_sale_id,
    'sale_number', v_sale_number,
    'total', v_total,
    'change', v_change,
    'duplicate', false
  );
end;
$$;
