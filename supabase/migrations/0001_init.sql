-- ============================================================================
-- Hot Wheels / Die-Cast Koleksiyon Satış Sitesi — İlk şema
-- Bu dosyayı Supabase Dashboard > SQL Editor içinde çalıştırın
-- (veya `supabase db push` ile Supabase CLI üzerinden uygulayın).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Yeni bir auth.users kaydı oluştuğunda otomatik profil satırı oluştur.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin kontrolü için yardımcı fonksiyon (RLS policy'lerinde recursive select'i önler).
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- product_types (Mainline, Premium, Treasure Hunt, ... — admin genişletebilir)
-- ----------------------------------------------------------------------------
create table public.product_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- tags
-- ----------------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text unique,
  barcode text,

  name text not null,
  brand text,
  manufacturer text,
  model text,
  series text,
  subseries text,
  category_id uuid references public.categories (id) on delete set null,
  product_type_id uuid references public.product_types (id) on delete set null,

  model_year integer,
  production_year integer,
  release_year integer,

  scale text,
  color text,
  wheel_type text,
  production_country text,

  package_type text check (package_type in ('carded', 'loose', 'opened')),
  condition text check (condition in ('Mint', 'Near Mint', 'Very Good', 'Good', 'Used')),
  card_condition text check (card_condition in ('Mint', 'Minor Wear', 'Soft Corners', 'Creased', 'Damaged')),
  condition_notes text,

  price numeric(10, 2) not null check (price >= 0),
  sale_price numeric(10, 2) check (sale_price >= 0),
  stock integer not null default 1 check (stock >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'sold', 'hidden')),
  featured boolean not null default false,
  rare boolean not null default false,
  active boolean not null default true,

  description text,
  collector_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sold_at timestamptz,
  deleted_at timestamptz
);

create index products_slug_idx on public.products (slug);
create index products_status_active_idx on public.products (status, active, deleted_at);
create index products_category_idx on public.products (category_id);
create index products_product_type_idx on public.products (product_type_id);
create index products_created_at_idx on public.products (created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ----------------------------------------------------------------------------
-- product_tags
-- ----------------------------------------------------------------------------
create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- orders / order_items
-- ----------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('HW-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text,
  district text,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_payment', 'paid', 'preparing', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  price_snapshot numeric(10, 2) not null,
  quantity integer not null default 1 check (quantity > 0)
);

create index order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- site_settings
-- ----------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb
);

-- ----------------------------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

-- ============================================================================
-- Sipariş oluşturma: atomik stok kontrolü (race condition korumalı)
-- ============================================================================
create function public.create_order(
  p_customer_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_district text,
  p_items jsonb -- [{ "product_id": "uuid", "quantity": 1 }, ...]
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.products%rowtype;
  v_total numeric(10, 2) := 0;
  v_order public.orders%rowtype;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  -- Önce tüm satırları kilitle ve doğrula (deadlock riskini azaltmak için id sırasına göre).
  for v_item in
    select value from jsonb_array_elements(p_items) as t(value)
    order by (value ->> 'product_id')
  loop
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found or v_product.deleted_at is not null then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;

    if v_product.status = 'sold' or v_product.active = false or v_product.stock < (v_item ->> 'quantity')::integer then
      raise exception 'OUT_OF_STOCK: %', v_product.name;
    end if;

    v_total := v_total + coalesce(v_product.sale_price, v_product.price) * (v_item ->> 'quantity')::integer;
  end loop;

  insert into public.orders (customer_name, email, phone, address, city, district, total)
  values (p_customer_name, p_email, p_phone, p_address, p_city, p_district, v_total)
  returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items) as t(value)
  loop
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid;

    insert into public.order_items (order_id, product_id, product_name_snapshot, price_snapshot, quantity)
    values (
      v_order.id,
      v_product.id,
      v_product.name,
      coalesce(v_product.sale_price, v_product.price),
      (v_item ->> 'quantity')::integer
    );

    update public.products
    set stock = stock - (v_item ->> 'quantity')::integer,
        status = case when stock - (v_item ->> 'quantity')::integer <= 0 then 'sold' else status end,
        sold_at = case when stock - (v_item ->> 'quantity')::integer <= 0 then now() else sold_at end
    where id = v_product.id;
  end loop;

  insert into public.activity_logs (action, entity, entity_id, metadata)
  values ('order_created', 'order', v_order.id, jsonb_build_object('order_number', v_order.order_number, 'total', v_total));

  return v_order;
end;
$$;

grant execute on function public.create_order(text, text, text, text, text, text, jsonb) to anon, authenticated;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.product_types enable row level security;
alter table public.tags enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_tags enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());

-- categories
create policy "categories_select_public" on public.categories for select using (active = true or public.is_admin());
create policy "categories_write_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- product_types
create policy "product_types_select_all" on public.product_types for select using (true);
create policy "product_types_write_admin" on public.product_types for all using (public.is_admin()) with check (public.is_admin());

-- tags
create policy "tags_select_all" on public.tags for select using (true);
create policy "tags_write_admin" on public.tags for all using (public.is_admin()) with check (public.is_admin());

-- products
create policy "products_select_public" on public.products
  for select using (
    (active = true and deleted_at is null and status in ('published', 'sold'))
    or public.is_admin()
  );
create policy "products_write_admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- product_images
create policy "product_images_select_public" on public.product_images
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.active = true and p.deleted_at is null and p.status in ('published', 'sold')
    )
  );
create policy "product_images_write_admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- product_tags
create policy "product_tags_select_public" on public.product_tags for select using (true);
create policy "product_tags_write_admin" on public.product_tags for all using (public.is_admin()) with check (public.is_admin());

-- orders / order_items — sadece admin okur/yazar, oluşturma create_order() RPC'si üzerinden (security definer)
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- site_settings
create policy "site_settings_select_public" on public.site_settings for select using (true);
create policy "site_settings_write_admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- activity_logs
create policy "activity_logs_admin_all" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());
