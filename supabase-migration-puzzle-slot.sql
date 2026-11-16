alter table public.calendar_media drop constraint if exists calendar_media_slot_type_check;
alter table public.calendar_media
  add constraint calendar_media_slot_type_check check (slot_type in ('cover', 'gift', 'music', 'puzzle'));

alter table public.calendar_media drop constraint if exists calendar_media_slot_number_check;
alter table public.calendar_media
  add constraint calendar_media_slot_number_check check (
    (slot_type = 'cover' and slot_number between 1 and 5)
    or (slot_type = 'gift' and slot_number between 1 and 24)
    or (slot_type = 'music' and slot_number = 0)
    or (slot_type = 'puzzle' and slot_number = 0)
  );
