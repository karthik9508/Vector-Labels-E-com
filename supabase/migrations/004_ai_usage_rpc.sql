-- Atomic increment for user AI usage.
-- Use this instead of read-then-write to avoid race conditions.

create or replace function public.increment_user_ai_usage(
  p_email text,
  p_date text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.user_ai_usage (email, date, count)
  values (p_email, p_date, 1)
  on conflict (email, date) do update
    set count = user_ai_usage.count + 1;
end;
$$;
