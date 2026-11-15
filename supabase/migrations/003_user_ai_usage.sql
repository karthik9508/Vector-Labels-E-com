-- Per-user daily AI generation limits.
-- One row per user per day. The server increments atomically.

create table public.user_ai_usage (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  date text not null, -- YYYY-MM-DD
  count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_ai_usage_unique unique (email, date)
);

alter table public.user_ai_usage enable row level security;

-- Users can read and update their own row.
create policy "Users manage their own usage"
  on public.user_ai_usage
  for all
  using (auth.uid()::text = email or auth.jwt() ->> 'email' = email)
  with check (auth.uid()::text = email or auth.jwt() ->> 'email' = email);
