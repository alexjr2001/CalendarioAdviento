import { NextResponse } from 'next/server';
import { getCalendarByEditorToken } from '@/lib/calendar';
import { checkEditorRateLimit, editorRateLimitResponse, isSameOriginRequest } from '@/lib/editor-security';
import { getDesignDefinition } from '@/lib/designs';
import { supabaseAdmin } from '@/lib/supabase-admin';

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function PATCH(request, { params }) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  const rateLimitResponse = editorRateLimitResponse(await checkEditorRateLimit(request.headers));
  if (rateLimitResponse) return rateLimitResponse;

  const { token } = await params;
  const calendar = await getCalendarByEditorToken(token);
  if (!calendar) return NextResponse.json({ error: 'El enlace de edición no es válido.' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }

  const fields = getDesignDefinition(calendar.design).fields;
  const submitted = body.settings || {};
  const settings = { ...(calendar.settings || {}) };
  if (Object.hasOwn(submitted, 'doorOrder')) {
    const order = submitted.doorOrder;
    const valid = order === null || (Array.isArray(order) && order.length === 24 && new Set(order).size === 24 && order.every(day => Number.isInteger(day) && day >= 1 && day <= 24));
    if (!valid) return NextResponse.json({ error: 'El orden de las puertas no es válido.' }, { status: 400 });
    if (order === null) delete settings.doorOrder;
    else settings.doorOrder = order;
  }
  for (const field of fields) {
    if (!Object.hasOwn(submitted, field.key)) continue;
    const rawValue = submitted[field.key];
    if (field.type === 'checkbox') {
      settings[field.key] = rawValue === true;
      continue;
    }

    const value = String(rawValue ?? '').trim();
    if (field.required && !value) return NextResponse.json({ error: `Completa el campo "${field.label}".` }, { status: 400 });
    if (field.maxLength && value.length > field.maxLength) return NextResponse.json({ error: `El campo "${field.label}" es demasiado largo.` }, { status: 400 });
    if (field.type === 'date' && value && !isValidDate(value)) return NextResponse.json({ error: `La fecha de "${field.label}" no es válida.` }, { status: 400 });
    if (field.type === 'number' && value) {
      const number = Number(value);
      if (!Number.isFinite(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) {
        return NextResponse.json({ error: `El valor de "${field.label}" no es válido.` }, { status: 400 });
      }
      settings[field.key] = number;
      continue;
    }
    if (field.type === 'select' && !field.options?.some(option => (typeof option === 'string' ? option : option.value) === value)) {
      return NextResponse.json({ error: `Elige una opción válida para "${field.label}".` }, { status: 400 });
    }
    settings[field.key] = value;
  }

  if (submitted.scratchEnabled === true) {
    const requiredScratchFields = ['relationshipStartDate', 'scratchTitle', 'scratchHint', 'scratchEndText'];
    const incomplete = requiredScratchFields.some(key => !String(settings[key] || '').trim());
    if (incomplete || !isValidDate(String(settings.relationshipStartDate || ''))) {
      return NextResponse.json({ error: 'Completa la fecha y los tres textos antes de activar las tarjetas para rascar.' }, { status: 400 });
    }
  }

  const update = { settings };
  if (Object.hasOwn(settings, 'title')) update.title = settings.title;
  if (Object.hasOwn(settings, 'introText')) update.intro_text = settings.introText;
  if (Object.hasOwn(settings, 'displayText')) update.display_text = settings.displayText;
  if (Object.hasOwn(settings, 'relationshipStartDate')) update.relationship_start_date = settings.relationshipStartDate;

  const { error } = await supabaseAdmin.from('calendars').update(update).eq('id', calendar.id);
  if (error) return NextResponse.json({ error: 'No se pudieron guardar los cambios.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}