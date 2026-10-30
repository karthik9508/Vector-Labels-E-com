-- Vector Labels Supabase Schema Migration 001

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company_name text,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin', 'production')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  category text not null,
  description text,
  base_price_sq_mm numeric(10, 6) default 0.0010,
  min_order_qty integer default 1000,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Quotes Table
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  product_type text not null,
  quantity integer not null,
  width_mm integer not null,
  height_mm integer not null,
  color_layers integer default 2,
  estimated_price numeric(10, 2) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'ordered')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  total_amount numeric(10, 2) not null,
  currency text default 'INR',
  status text default 'payment_pending' check (status in ('payment_pending', 'paid', 'proof_review', 'in_production', 'dispatched', 'delivered', 'cancelled')),
  shipping_address jsonb,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_name text not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  specifications jsonb
);

-- 6. Artwork Proofs Table
create table public.artwork_proofs (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  proof_image_url text not null,
  status text default 'pending_review' check (status in ('pending_review', 'approved', 'revision_requested')),
  client_feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.artwork_proofs enable row level security;

-- Products are readable by everyone
create policy "Products are viewable by everyone" on public.products for select using (true);

-- Profiles: Users can view/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Quotes: Users can view/create their own quotes
create policy "Users can view own quotes" on public.quotes for select using (auth.uid() = user_id);
create policy "Users can create quotes" on public.quotes for insert with check (auth.uid() = user_id or user_id is null);

-- Orders: Users can view/create their own orders
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order Items: Viewable if user owns parent order
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Artwork Proofs: Viewable if user owns parent order
create policy "Users can view own proofs" on public.artwork_proofs for select using (
  exists (select 1 from public.orders where orders.id = artwork_proofs.order_id and orders.user_id = auth.uid())
);
create policy "Users can update proof status" on public.artwork_proofs for update using (
  exists (select 1 from public.orders where orders.id = artwork_proofs.order_id and orders.user_id = auth.uid())
);

-- 7. AI Concepts Table (generated label concepts from AI Studio)
create table public.ai_concepts (
  id text primary key,
  prompt text not null,
  product_slug text,
  width integer,
  height integer,
  color_layers integer,
  image_url text,
  logo_name text,
  enhanced_prompt text,
  status text default 'generated' check (status in ('generated', 'approved', 'in_production', 'ordered')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_concepts enable row level security;

-- AI concepts are viewable by everyone (public concept gallery)
create policy "AI concepts are viewable by everyone" on public.ai_concepts for select using (true);
create policy "Anyone can create AI concepts" on public.ai_concepts for insert with check (true);
