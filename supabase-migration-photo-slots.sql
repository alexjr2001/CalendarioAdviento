do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'calendar_media_slot_number_check'
      and conrelid = 'public.calendar_media'::regclass
  ) then
    alter table public.calendar_media
      add constraint calendar_media_slot_number_check check (
        (slot_type = 'cover' and slot_number between 1 and 5)
        or (slot_type = 'gift' and slot_number between 1 and 24)
        or (slot_type = 'music' and slot_number = 0)
      ) not valid;
  end if;
end;
$$;

alter table public.calendars
  add column if not exists title text not null default E'24 Augenblicke\nfür dich.',
  add column if not exists intro_text text not null default 'Ein kleines Ritual, das die Wartezeit schöner macht. Öffne jeden Tag eine Tür und bewahre den Augenblick.',
  add column if not exists display_text text not null default 'Name 1 & Name 2';

update public.calendars
set display_text = concat_ws(' & ', nullif(trim(name_one), ''), nullif(trim(name_two), ''))
where display_text = 'Name 1 & Name 2'
  and (name_one <> 'Name 1' or name_two <> 'Name 2');

alter table public.calendar_media
  add column if not exists caption text not null default '';

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
      'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm'
    ]
where id = 'calendar-media';