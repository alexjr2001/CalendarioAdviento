update storage.buckets
set allowed_mime_types = array_append(coalesce(allowed_mime_types, '{}'::text[]), 'audio/webm')
where id = 'calendar-media'
  and not ('audio/webm' = any(coalesce(allowed_mime_types, '{}'::text[])));