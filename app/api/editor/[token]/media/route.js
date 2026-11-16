import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCalendarByEditorToken, getSignedMediaUrl } from '@/lib/calendar';
import { isCalendarGame } from '@/lib/game-catalog';
import { checkEditorRateLimit, editorRateLimitResponse, isSameOriginRequest } from '@/lib/editor-security';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FILE_TYPES = {
  'audio/aac': { extension: 'aac', mediaType: 'audio' },
  'audio/mp4': { extension: 'm4a', mediaType: 'audio' },
  'audio/mpeg': { extension: 'mp3', mediaType: 'audio' },
  'audio/ogg': { extension: 'ogg', mediaType: 'audio' },
  'audio/wav': { extension: 'wav', mediaType: 'audio' },
  'audio/x-wav': { extension: 'wav', mediaType: 'audio' },
  'audio/webm': { extension: 'webm', mediaType: 'audio' },
  'image/avif': { extension: 'avif', mediaType: 'image' },
  'image/gif': { extension: 'gif', mediaType: 'image' },
  'image/jpeg': { extension: 'jpg', mediaType: 'image' },
  'image/png': { extension: 'png', mediaType: 'image' },
  'image/webp': { extension: 'webp', mediaType: 'image' },
  'video/mp4': { extension: 'mp4', mediaType: 'video' },
  'video/quicktime': { extension: 'mov', mediaType: 'video' },
  'video/webm': { extension: 'webm', mediaType: 'video' }
};

function parseSlot(slotType, slotNumber, mediaType) {
  const number = Number(slotNumber);
  if (!Number.isInteger(number)) return null;
  if (slotType === 'cover' && number >= 1 && number <= 5 && (!mediaType || mediaType === 'image')) return { type: slotType, number };
  if (slotType === 'gift' && number >= 1 && number <= 24 && (!mediaType || ['image', 'video', 'audio'].includes(mediaType))) return { type: slotType, number };
  if (slotType === 'music' && number === 0 && (!mediaType || mediaType === 'audio')) return { type: slotType, number };
  if (slotType === 'puzzle' && number === 0 && (!mediaType || mediaType === 'image')) return { type: slotType, number };
  return null;
}

async function getAuthorizedCalendar(params) {
  const { token } = await params;
  return getCalendarByEditorToken(token);
}

export async function POST(request, { params }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const rateLimitResponse = editorRateLimitResponse(await checkEditorRateLimit(request.headers));
  if (rateLimitResponse) return rateLimitResponse;

  const calendar = await getAuthorizedCalendar(params);
  if (!calendar) return NextResponse.json({ error: 'El enlace de edición no es válido.' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }

  if (body.action === 'prepare') {
    const type = FILE_TYPES[body.contentType];
    const slot = parseSlot(body.slotType, body.slotNumber, type?.mediaType);
    const size = Number(body.fileSize);
    if (!slot || !type) {
      return NextResponse.json({ error: 'Este tipo de archivo no es válido para este espacio.' }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'El archivo no puede superar los 50 MB.' }, { status: 400 });
    }

    const storagePath = `${calendar.id}/${slot.type}/${slot.number}-${randomUUID()}.${type.extension}`;
    const { data, error } = await supabaseAdmin.storage.from('calendar-media').createSignedUploadUrl(storagePath);
    if (error) return NextResponse.json({ error: 'No se pudo preparar la carga.' }, { status: 500 });
    return NextResponse.json({ path: storagePath, token: data.token, mediaType: type.mediaType });
  }

  if (body.action === 'complete') {
    const type = FILE_TYPES[body.contentType];
    const slot = parseSlot(body.slotType, body.slotNumber, type?.mediaType);
    const storagePath = String(body.path || '');
    const expectedPrefix = slot ? `${calendar.id}/${slot.type}/${slot.number}-` : '';
    if (!slot || !type || !storagePath.startsWith(expectedPrefix) || !storagePath.endsWith(`.${type.extension}`)) {
      return NextResponse.json({ error: 'El archivo subido no corresponde a este espacio.' }, { status: 400 });
    }

    const { data: signedFile, error: fileError } = await supabaseAdmin.storage
      .from('calendar-media')
      .createSignedUrl(storagePath, 60 * 60);
    if (fileError) return NextResponse.json({ error: 'No se encontró el archivo subido.' }, { status: 400 });

    const caption = slot.type === 'gift' ? String(body.caption || '').trim().slice(0, 500) : '';
    const { data: previous } = await supabaseAdmin
      .from('calendar_media')
      .select('storage_path')
      .eq('calendar_id', calendar.id)
      .eq('slot_type', slot.type)
      .eq('slot_number', slot.number)
      .maybeSingle();
    const previousPath = previous?.storage_path || (slot.type === 'music' ? calendar.music_path : null);

    const { data: media, error: saveError } = await supabaseAdmin
      .from('calendar_media')
      .upsert({
        calendar_id: calendar.id,
        slot_type: slot.type,
        slot_number: slot.number,
        storage_path: storagePath,
        media_type: type.mediaType,
        caption
      }, { onConflict: 'calendar_id,slot_type,slot_number' })
      .select('id, calendar_id, slot_type, slot_number, storage_path, media_type, caption')
      .single();

    if (saveError) {
      await supabaseAdmin.storage.from('calendar-media').remove([storagePath]);
      return NextResponse.json({ error: 'No se pudo guardar el archivo.' }, { status: 500 });
    }
    if (slot.type === 'gift' && calendar.settings?.giftGames?.[slot.number]) {
      const giftGames = { ...calendar.settings.giftGames };
      delete giftGames[slot.number];
      const { error: settingsError } = await supabaseAdmin
        .from('calendars')
        .update({ settings: { ...(calendar.settings || {}), giftGames } })
        .eq('id', calendar.id);
      if (settingsError) return NextResponse.json({ error: 'Se guardó el archivo, pero no se pudo quitar el juego anterior.' }, { status: 500 });
    }
    if (slot.type === 'music') {
      const { error: settingsError } = await supabaseAdmin
        .from('calendars')
        .update({ music_path: storagePath })
        .eq('id', calendar.id);
      if (settingsError) return NextResponse.json({ error: 'Se subió la música, pero no se pudo vincular al calendario.' }, { status: 500 });
    }
    if (previousPath && previousPath !== storagePath) {
      await supabaseAdmin.storage.from('calendar-media').remove([previousPath]);
    }

    return NextResponse.json({ media: { ...media, url: signedFile.signedUrl } });
  }

  return NextResponse.json({ error: 'La acción no es válida.' }, { status: 400 });
}

export async function PATCH(request, { params }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const rateLimitResponse = editorRateLimitResponse(await checkEditorRateLimit(request.headers));
  if (rateLimitResponse) return rateLimitResponse;

  const calendar = await getAuthorizedCalendar(params);
  if (!calendar) return NextResponse.json({ error: 'El enlace de edición no es válido.' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }
  if (body.action === 'set-gift-game') {
    const slot = parseSlot('gift', body.slotNumber);
    const game = body.game === null ? null : body.game;
    if (!slot || (game !== null && !isCalendarGame(game))) {
      return NextResponse.json({ error: 'No se puede asignar este juego a la puerta.' }, { status: 400 });
    }

    if (game) {
      const { data: previousMedia, error: findError } = await supabaseAdmin
        .from('calendar_media')
        .select('storage_path')
        .eq('calendar_id', calendar.id)
        .eq('slot_type', 'gift')
        .eq('slot_number', slot.number)
        .maybeSingle();
      if (findError) return NextResponse.json({ error: 'No se pudo encontrar el contenido anterior.' }, { status: 500 });
      if (previousMedia) {
        const { error: deleteError } = await supabaseAdmin
          .from('calendar_media')
          .delete()
          .eq('calendar_id', calendar.id)
          .eq('slot_type', 'gift')
          .eq('slot_number', slot.number);
        if (deleteError) return NextResponse.json({ error: 'No se pudo reemplazar el contenido anterior.' }, { status: 500 });
        await supabaseAdmin.storage.from('calendar-media').remove([previousMedia.storage_path]);
      }
    }

    const giftGames = { ...(calendar.settings?.giftGames || {}) };
    if (game) giftGames[slot.number] = game;
    else delete giftGames[slot.number];
    const { error } = await supabaseAdmin
      .from('calendars')
      .update({ settings: { ...(calendar.settings || {}), giftGames } })
      .eq('id', calendar.id);
    if (error) return NextResponse.json({ error: 'No se pudo guardar el juego.' }, { status: 500 });
    return NextResponse.json({ ok: true, game });
  }
  if (body.action === 'reorder-covers') {
    const order = body.order;
    const validOrder = Array.isArray(order)
      && order.length === 5
      && new Set(order).size === 5
      && order.every(number => Number.isInteger(number) && number >= 1 && number <= 5);
    if (!validOrder) return NextResponse.json({ error: 'El orden de las fotos de portada no es válido.' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('calendars')
      .update({ settings: { ...(calendar.settings || {}), coverOrder: order } })
      .eq('id', calendar.id);
    if (error) return NextResponse.json({ error: 'No se pudo guardar el orden.' }, { status: 500 });
    return NextResponse.json({ ok: true, order });
  }

  const slot = parseSlot(body.slotType, body.slotNumber);
  if (!slot || slot.type !== 'gift') return NextResponse.json({ error: 'La puerta no es válida.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('calendar_media')
    .update({ caption: String(body.caption || '').trim().slice(0, 500) })
    .eq('calendar_id', calendar.id)
    .eq('slot_type', slot.type)
    .eq('slot_number', slot.number)
    .select('id')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'No se pudo guardar el texto de la puerta.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Primero sube una foto o un video para esta puerta.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const rateLimitResponse = editorRateLimitResponse(await checkEditorRateLimit(request.headers));
  if (rateLimitResponse) return rateLimitResponse;

  const calendar = await getAuthorizedCalendar(params);
  if (!calendar) return NextResponse.json({ error: 'El enlace de edición no es válido.' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }
  const slot = parseSlot(body.slotType, body.slotNumber, body.mediaType);
  if (!slot) return NextResponse.json({ error: 'El espacio para la foto no es válido.' }, { status: 400 });

  const { data: media, error: findError } = await supabaseAdmin
    .from('calendar_media')
    .select('storage_path')
    .eq('calendar_id', calendar.id)
    .eq('slot_type', slot.type)
    .eq('slot_number', slot.number)
    .maybeSingle();
  if (findError) return NextResponse.json({ error: 'No se pudo encontrar el archivo.' }, { status: 500 });
  const storagePath = media?.storage_path || (slot.type === 'music' ? calendar.music_path : null);
  if (!storagePath) return NextResponse.json({ ok: true });

  if (media) {
    const { error: deleteError } = await supabaseAdmin
      .from('calendar_media')
      .delete()
      .eq('calendar_id', calendar.id)
      .eq('slot_type', slot.type)
      .eq('slot_number', slot.number);
    if (deleteError) return NextResponse.json({ error: 'No se pudo eliminar el archivo.' }, { status: 500 });
  }

  const { error: storageError } = await supabaseAdmin.storage.from('calendar-media').remove([storagePath]);
  if (storageError) return NextResponse.json({ error: 'Se eliminó la referencia, pero no se pudo quitar el archivo.' }, { status: 500 });
  if (slot.type === 'music') {
    await supabaseAdmin.from('calendars').update({ music_path: null }).eq('id', calendar.id);
  }
  return NextResponse.json({ ok: true });
}