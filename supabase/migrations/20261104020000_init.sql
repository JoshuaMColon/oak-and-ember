-- Oak & Ember catalog, carts, orders, reviews, and admin role.
-- Lives in the oak schema (shared Supabase project). Role checks read oak.profiles,
-- never user-editable auth user_metadata.

create schema if not exists oak;
revoke all on schema oak from public;
grant usage on schema oak to anon, authenticated, service_role;

create type oak.user_role as enum ('customer', 'admin');
create type oak.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

create table oak.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role oak.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table oak.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text not null default ''
);

create table oak.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references oak.categories (id) on delete restrict,
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

create index products_fts_idx on oak.products using gin (fts);
create index products_category_idx on oak.products (category_id);

create table oak.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references oak.products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  credit text,
  sort_order integer not null default 0
);

create table oak.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references oak.products (id) on delete cascade,
  sku text not null unique,
  finish text not null,
  material text not null,
  color text not null,
  color_hex text not null default '#d8c7ae',
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0)
);

create index product_variants_product_idx on oak.product_variants (product_id);

create table oak.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references oak.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  created_at timestamptz not null default now()
);

create unique index reviews_one_per_user on oak.reviews (product_id, user_id) where user_id is not null;
create index reviews_product_idx on oak.reviews (product_id);

create table oak.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table oak.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references oak.carts (id) on delete cascade,
  variant_id uuid not null references oak.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unique (cart_id, variant_id)
);

create table oak.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  status oak.order_status not null default 'pending',
  stripe_session_id text unique,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_name text,
  shipping_address text,
  created_at timestamptz not null default now()
);

create index orders_user_idx on oak.orders (user_id);

create table oak.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references oak.orders (id) on delete cascade,
  variant_id uuid references oak.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0)
);

create table oak.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references oak.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create or replace function oak.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from oak.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function oak.is_admin() from public;
grant execute on function oak.is_admin() to authenticated, service_role;

create or replace function oak.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), '') <> 'service_role' and not oak.is_admin() then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger oak_profiles_role_guard
  before update on oak.profiles
  for each row execute function oak.prevent_role_escalation();

alter table oak.profiles enable row level security;
alter table oak.categories enable row level security;
alter table oak.products enable row level security;
alter table oak.product_images enable row level security;
alter table oak.product_variants enable row level security;
alter table oak.reviews enable row level security;
alter table oak.carts enable row level security;
alter table oak.cart_items enable row level security;
alter table oak.orders enable row level security;
alter table oak.order_items enable row level security;
alter table oak.wishlists enable row level security;

create policy "read profiles" on oak.profiles
  for select to authenticated
  using (id = (select auth.uid()) or oak.is_admin());

create policy "insert own profile" on oak.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'customer');

create policy "update profiles" on oak.profiles
  for update to authenticated
  using (id = (select auth.uid()) or oak.is_admin())
  with check (id = (select auth.uid()) or oak.is_admin());

create policy "public read categories" on oak.categories
  for select to anon, authenticated using (true);
create policy "admins insert categories" on oak.categories
  for insert to authenticated with check (oak.is_admin());
create policy "admins update categories" on oak.categories
  for update to authenticated using (oak.is_admin()) with check (oak.is_admin());
create policy "admins delete categories" on oak.categories
  for delete to authenticated using (oak.is_admin());

create policy "public read products" on oak.products
  for select to anon, authenticated using (true);
create policy "admins insert products" on oak.products
  for insert to authenticated with check (oak.is_admin());
create policy "admins update products" on oak.products
  for update to authenticated using (oak.is_admin()) with check (oak.is_admin());
create policy "admins delete products" on oak.products
  for delete to authenticated using (oak.is_admin());

create policy "public read images" on oak.product_images
  for select to anon, authenticated using (true);
create policy "admins insert images" on oak.product_images
  for insert to authenticated with check (oak.is_admin());
create policy "admins update images" on oak.product_images
  for update to authenticated using (oak.is_admin()) with check (oak.is_admin());
create policy "admins delete images" on oak.product_images
  for delete to authenticated using (oak.is_admin());

create policy "public read variants" on oak.product_variants
  for select to anon, authenticated using (true);
create policy "admins insert variants" on oak.product_variants
  for insert to authenticated with check (oak.is_admin());
create policy "admins update variants" on oak.product_variants
  for update to authenticated using (oak.is_admin()) with check (oak.is_admin());
create policy "admins delete variants" on oak.product_variants
  for delete to authenticated using (oak.is_admin());

create policy "public read reviews" on oak.reviews
  for select to anon, authenticated using (true);
create policy "insert own review" on oak.reviews
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own review" on oak.reviews
  for update to authenticated
  using (user_id = (select auth.uid()) or oak.is_admin())
  with check (user_id = (select auth.uid()) or oak.is_admin());
create policy "delete own review" on oak.reviews
  for delete to authenticated
  using (user_id = (select auth.uid()) or oak.is_admin());

create policy "own cart" on oak.carts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own cart items" on oak.cart_items
  for all to authenticated
  using (
    exists (
      select 1 from oak.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from oak.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  );

create policy "read own orders" on oak.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or oak.is_admin());

create policy "admins update orders" on oak.orders
  for update to authenticated
  using (oak.is_admin())
  with check (oak.is_admin());

create policy "read own order items" on oak.order_items
  for select to authenticated
  using (
    exists (
      select 1 from oak.orders
      where orders.id = order_items.order_id
        and (orders.user_id = (select auth.uid()) or oak.is_admin())
    )
  );

create policy "own wishlist" on oak.wishlists
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on oak.categories, oak.products, oak.product_images, oak.product_variants, oak.reviews to anon, authenticated;
grant select, insert, update on oak.profiles to authenticated;
grant insert, update, delete on oak.categories, oak.products, oak.product_images, oak.product_variants to authenticated;
grant insert, update, delete on oak.reviews to authenticated;
grant select, insert, update, delete on oak.carts, oak.cart_items, oak.wishlists to authenticated;
grant select, update on oak.orders to authenticated;
grant select on oak.order_items to authenticated;

insert into storage.buckets (id, name, public)
values ('oak-products', 'oak-products', true)
on conflict (id) do nothing;

create policy "Oak & Ember: public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'oak-products');

create policy "Oak & Ember: admins insert product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'oak-products' and oak.is_admin());

create policy "Oak & Ember: admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'oak-products' and oak.is_admin())
  with check (bucket_id = 'oak-products' and oak.is_admin());

create policy "Oak & Ember: admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'oak-products' and oak.is_admin());

-- Service role (Stripe webhook) bypasses RLS but still needs grants.
grant all on all tables in schema oak to service_role;

-- Data API: only public is exposed on this shared project, so each table gets a
-- security_invoker view named public.oak_<table> (same pattern as xplan_* and weather_*).
create view public.oak_profiles with (security_invoker = true) as select * from oak.profiles;
create view public.oak_categories with (security_invoker = true) as select * from oak.categories;
create view public.oak_products with (security_invoker = true) as select * from oak.products;
create view public.oak_product_images with (security_invoker = true) as select * from oak.product_images;
create view public.oak_product_variants with (security_invoker = true) as select * from oak.product_variants;
create view public.oak_reviews with (security_invoker = true) as select * from oak.reviews;
create view public.oak_carts with (security_invoker = true) as select * from oak.carts;
create view public.oak_cart_items with (security_invoker = true) as select * from oak.cart_items;
create view public.oak_orders with (security_invoker = true) as select * from oak.orders;
create view public.oak_order_items with (security_invoker = true) as select * from oak.order_items;
create view public.oak_wishlists with (security_invoker = true) as select * from oak.wishlists;

revoke all on public.oak_profiles, public.oak_categories, public.oak_products, public.oak_product_images, public.oak_product_variants, public.oak_reviews, public.oak_carts, public.oak_cart_items, public.oak_orders, public.oak_order_items, public.oak_wishlists from anon, authenticated;
grant all on public.oak_profiles, public.oak_categories, public.oak_products, public.oak_product_images, public.oak_product_variants, public.oak_reviews, public.oak_carts, public.oak_cart_items, public.oak_orders, public.oak_order_items, public.oak_wishlists to service_role;
grant select on public.oak_categories, public.oak_products, public.oak_product_images, public.oak_product_variants, public.oak_reviews to anon, authenticated;
grant select, insert, update on public.oak_profiles to authenticated;
grant insert, update, delete on public.oak_categories, public.oak_products, public.oak_product_images, public.oak_product_variants, public.oak_reviews to authenticated;
grant select, insert, update, delete on public.oak_carts, public.oak_cart_items, public.oak_wishlists to authenticated;
grant select, update on public.oak_orders to authenticated;
grant select on public.oak_order_items to authenticated;
