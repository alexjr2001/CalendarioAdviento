import { supabaseAdmin } from './supabase-admin';
import { hashEditorToken } from './tokens';

export async function getCalendarBySlug(slug) {
  const { data, error } = await supabaseAdmin
    .from('calendars')
    .select('id, slug, design, settings, title, intro_text, display_text, relationship_start_date, music_path, active, calendar_media(*)')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCalendarByEditorToken(token) {
  const { data, error } = await supabaseAdmin
    .from('calendars')
    .select('id, slug, design, settings, title, intro_text, display_text, relationship_start_date, editor_token_expires_at, music_path, active, calendar_media(*)')
    .eq('editor_token_hash', hashEditorToken(token))
    .eq('active', true)
    .gt('editor_token_expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSignedMediaUrl(path) {
  if (!path) return '';
  const { data, error } = await supabaseAdmin.storage.from('calendar-media').createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) throw error;
  return data.signedUrl;
}
