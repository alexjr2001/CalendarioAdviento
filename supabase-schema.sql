create extension if not exists pgcrypto;

create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  editor_token_hash text not null unique,
  editor_token_expires_at timestamptz not null default (now() + interval '365 days'),
  design text not null default 'design1',
  settings jsonb not null default '{}'::jsonb,
  title text not null default E'24 Augenblicke\nfür dich.',
  intro_text text not null default 'Ein kleines Ritual, das die Wartezeit schöner macht. Öffne jeden Tag eine Tür und bewahre den Augenblick.',
  display_text text not null default 'Name 1 & Name 2',
  name_one text not null default 'Name 1',
  name_two text not null default 'Name 2',
  relationship_start_date date not null,
  music_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_media (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  slot_type text not null check (slot_type in ('cover', 'gift', 'music', 'puzzle')),
  slot_number integer not null,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video', 'audio')),
  caption text not null default '',
  constraint calendar_media_slot_number_check check (
    (slot_type = 'cover' and slot_number between 1 and 5)
    or (slot_type = 'gift' and slot_number between 1 and 24)
    or (slot_type = 'music' and slot_number = 0)
    or (slot_type = 'puzzle' and slot_number = 0)
  ),
  created_at timestamptz not null default now(),
  unique (calendar_id, slot_type, slot_number)
);

create index calendar_media_calendar_id_idx on public.calendar_media(calendar_id);

create table public.editor_rate_limits (
  ip_hash text primary key check (ip_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0)
);

create index editor_rate_limits_window_started_at_idx on public.editor_rate_limits(window_started_at);

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger calendars_updated_at
before update on public.calendars
for each row execute function public.set_updated_at();

alter table public.calendars enable row level security;
alter table public.calendar_media enable row level security;

-- Public clients must never be able to read calendars directly because that would
-- expose editor_token_hash. Public and editor routes will query with service_role.
revoke all on public.calendars from anon, authenticated;
revoke all on public.calendar_media from anon, authenticated;

-- Inserts/updates/deletes should be performed by server-side routes after validating
-- the private editor token. Do not add anon write policies.

insert into storage.buckets (id, name, public)
values ('calendar-media', 'calendar-media', false)
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
      'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'
    ]
where id = 'calendar-media';
