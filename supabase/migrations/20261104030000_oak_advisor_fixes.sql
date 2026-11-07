-- Advisor fixes: cover foreign keys, and keep anonymous-auth sessions (enabled
-- project-wide for other apps on this shared project) out of Oak & Ember writes
-- and private reads. Catalog reads stay public.
--
-- These are restrictive policies, so they AND with the permissive policies
-- from the init migration.
-- `anon` (no session, public catalog) is a different role and is not covered
-- here. `authenticated` with is_anonymous = true is a signed-in anonymous
-- user from another app, and I don't want that JWT writing oak rows.
create index if not exists cart_items_variant_idx on oak.cart_items (variant_id);
create index if not exists order_items_order_idx on oak.order_items (order_id);
create index if not exists order_items_variant_idx on oak.order_items (variant_id);
create index if not exists product_images_product_idx on oak.product_images (product_id);
create index if not exists reviews_user_idx on oak.reviews (user_id);
create index if not exists wishlists_product_idx on oak.wishlists (product_id);

do $$
declare
  t text;
  cmd text;
  guard constant text := 'coalesce((select (auth.jwt() ->> ''is_anonymous'')::boolean), false) = false';
begin
  foreach t in array array['profiles','categories','products','product_images','product_variants','reviews','carts','cart_items','orders','order_items','wishlists'] loop
    execute format('create policy "no anonymous inserts" on oak.%I as restrictive for insert to authenticated with check (%s)', t, guard);
    execute format('create policy "no anonymous updates" on oak.%I as restrictive for update to authenticated using (%s) with check (%s)', t, guard, guard);
    execute format('create policy "no anonymous deletes" on oak.%I as restrictive for delete to authenticated using (%s)', t, guard);
  end loop;
  foreach t in array array['profiles','carts','cart_items','orders','order_items','wishlists'] loop
    execute format('create policy "no anonymous reads" on oak.%I as restrictive for select to authenticated using (%s)', t, guard);
  end loop;
end $$;
