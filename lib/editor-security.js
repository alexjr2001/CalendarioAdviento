import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

const MAX_EDITOR_REQUESTS = 180;
const RATE_WINDOW_SECONDS = 15 * 60;

export async function checkEditorRateLimit(headers) {
  const forwardedFor = headers.get('x-forwarded-for');
  const clientIp = headers.get('x-real-ip') || forwardedFor?.split(',').at(-1)?.trim() || 'unknown';
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const ipHash = createHash('sha256').update(`${clientIp}:${secret}`).digest('hex');
  const { data, error } = await supabaseAdmin.rpc('consume_editor_rate_limit', {
    p_ip_hash: ipHash,
    p_max_attempts: MAX_EDITOR_REQUESTS,
    p_window_seconds: RATE_WINDOW_SECONDS
  });

  if (error) return { allowed: false, unavailable: true };
  return { allowed: data === true, unavailable: false };
}

export function editorRateLimitResponse(result) {
  if (result.allowed) return null;
  const retryAfter = result.unavailable ? 60 : RATE_WINDOW_SECONDS;
  const status = result.unavailable ? 503 : 429;
  const message = result.unavailable
    ? 'La protección no está disponible en este momento.'
    : 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.';
  return NextResponse.json({ error: message }, { status, headers: { 'Retry-After': String(retryAfter) } });
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}