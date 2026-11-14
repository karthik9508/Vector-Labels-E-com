-- Vector Labels Supabase Schema Migration 002
-- Fixes two gaps in 001:
--   1. Signing up never created a `profiles` row, so role checks and the
--      admin panel could not work without manual SQL.
--   2. There was no policy letting an admin read other customers' orders,
--      so the admin dashboard could only ever show zeros.

-- ---------------------------------------------------------------------------
-- 1. Create a profile automatically for every new auth user
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before this migration.
insert into public.profiles (id, full_name, company_name)
select
  u.id,
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'company_name', '')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Admin read access
--    Existing policies are permissive, so these only widen access for accounts
--    whose profile role is 'admin'.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update using (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select using (public.is_admin());

drop policy if exists "Admins can view all proofs" on public.artwork_proofs;
create policy "Admins can view all proofs"
  on public.artwork_proofs for select using (public.is_admin());

drop policy if exists "Admins can create proofs" on public.artwork_proofs;
create policy "Admins can create proofs"
  on public.artwork_proofs for insert with check (public.is_admin());

drop policy if exists "Admins can view all quotes" on public.quotes;
create policy "Admins can view all quotes"
  on public.quotes for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Indexes used by the payment webhook and the order tracker
-- ---------------------------------------------------------------------------
create index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists ai_concepts_created_at_idx
  on public.ai_concepts (created_at desc);
