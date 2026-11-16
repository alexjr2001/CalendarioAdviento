alter table public.calendars
  add column if not exists settings jsonb not null default '{}'::jsonb;

alter table public.calendars
  drop constraint if exists calendars_design_check;

update public.calendars
set settings = jsonb_build_object(
  'title', title,
  'introText', intro_text,
  'displayText', display_text,
  'relationshipStartDate', relationship_start_date::text
)
where settings = '{}'::jsonb;