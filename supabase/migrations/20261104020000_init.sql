-- Oak & Ember catalog, carts, orders, reviews, and admin role.
-- Apply with the Supabase CLI or SQL editor. Role checks read public.profiles,
-- never user-editable auth user_metadata.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text not null default ''
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  price_cents integer not null check (price_cents >= 0),
  featured boolean not null default false,
  bestseller boolean not null default false,
  keywords text not null default '',
  created_at timestamptz not null default now(),
  fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(keywords, '')), 'C')
  ) stored
);

create index products_fts_idx on public.products using gin (fts);
create index products_category_idx on public.products (category_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  credit text,
  sort_order integer not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  finish text not null,
  material text not null,
  color text not null,
  color_hex text not null default '#d8c7ae',
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0)
);

create index product_variants_product_idx on public.product_variants (product_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  created_at timestamptz not null default now()
);

create unique index reviews_one_per_user on public.reviews (product_id, user_id) where user_id is not null;
create index reviews_product_idx on public.reviews (product_id);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unique (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending',
  stripe_session_id text unique,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_name text,
  shipping_address text,
  created_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated, service_role;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), '') <> 'service_role' and not private.is_admin() then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function private.prevent_role_escalation();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.reviews enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;

create policy "read profiles" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());

create policy "update profiles" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());

create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "admins insert categories" on public.categories
  for insert to authenticated with check (private.is_admin());
create policy "admins update categories" on public.categories
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins delete categories" on public.categories
  for delete to authenticated using (private.is_admin());

create policy "public read products" on public.products
  for select to anon, authenticated using (true);
create policy "admins insert products" on public.products
  for insert to authenticated with check (private.is_admin());
create policy "admins update products" on public.products
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins delete products" on public.products
  for delete to authenticated using (private.is_admin());

create policy "public read images" on public.product_images
  for select to anon, authenticated using (true);
create policy "admins insert images" on public.product_images
  for insert to authenticated with check (private.is_admin());
create policy "admins update images" on public.product_images
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins delete images" on public.product_images
  for delete to authenticated using (private.is_admin());

create policy "public read variants" on public.product_variants
  for select to anon, authenticated using (true);
create policy "admins insert variants" on public.product_variants
  for insert to authenticated with check (private.is_admin());
create policy "admins update variants" on public.product_variants
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "admins delete variants" on public.product_variants
  for delete to authenticated using (private.is_admin());

create policy "public read reviews" on public.reviews
  for select to anon, authenticated using (true);
create policy "insert own review" on public.reviews
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own review" on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid()) or private.is_admin())
  with check (user_id = (select auth.uid()) or private.is_admin());
create policy "delete own review" on public.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

create policy "own cart" on public.carts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own cart items" on public.cart_items
  for all to authenticated
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  );

create policy "read own orders" on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

create policy "admins update orders" on public.orders
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = (select auth.uid()) or private.is_admin())
    )
  );

create policy "own wishlist" on public.wishlists
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on public.categories, public.products, public.product_images, public.product_variants, public.reviews to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images, public.product_variants to authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.carts, public.cart_items, public.wishlists to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "admins insert product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and private.is_admin());

create policy "admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and private.is_admin())
  with check (bucket_id = 'product-images' and private.is_admin());

create policy "admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and private.is_admin());
