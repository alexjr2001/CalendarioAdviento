alter table public.calendars
  add column if not exists editor_token_expires_at timestamptz;

update public.calendars
set editor_token_expires_at = created_at + interval '365 days'
where editor_token_expires_at is null;

alter table public.calendars
  alter column editor_token_expires_at set default (now() + interval '365 days'),
  alter column editor_token_expires_at set not null;

create table if not exists public.editor_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0)
);

create index if not exists editor_rate_limits_window_started_at_idx
  on public.editor_rate_limits(window_started_at);

alter table public.editor_rate_limits enable row level security;
revoke all on public.editor_rate_limits from public, anon, authenticated;
grant all on public.editor_rate_limits to service_role;

create or replace function public.consume_editor_rate_limit(
  p_ip_hash text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_attempt_count integer;
begin
  if p_ip_hash !~ '^[0-9a-f]{64}$'
    or p_max_attempts < 1 or p_max_attempts > 1000
    or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;

  delete from public.editor_rate_limits
  where window_started_at < v_now - interval '1 day';

  insert into public.editor_rate_limits (ip_hash, window_started_at, attempt_count)
  values (p_ip_hash, v_now, 1)
  on conflict (ip_hash) do update
  set window_started_at = case
        when public.editor_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
          then v_now
        else public.editor_rate_limits.window_started_at
      end,
      attempt_count = case
        when public.editor_rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now
          then 1
        else public.editor_rate_limits.attempt_count + 1
      end
  returning attempt_count into v_attempt_count;

  return v_attempt_count <= p_max_attempts;
end;
$$;

revoke all on function public.consume_editor_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_editor_rate_limit(text, integer, integer) to service_role;