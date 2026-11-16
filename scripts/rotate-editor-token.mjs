import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createEditorToken, hashEditorToken } from '../lib/tokens.js';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const slug = process.argv[2]?.toLowerCase();
if (!slug) {
  console.error('Uso: npm run calendar:rotate-token -- <slug>');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const token = createEditorToken();
const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
const { data, error } = await supabase
  .from('calendars')
  .update({ editor_token_hash: hashEditorToken(token), editor_token_expires_at: expiresAt })
  .eq('slug', slug)
  .eq('active', true)
  .select('slug')
  .maybeSingle();

if (error || !data) {
  console.error(error ? `No se pudo rotar el token: ${error.message}` : 'No existe un calendario activo con ese slug.');
  process.exit(1);
}

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
console.log(`Token anterior invalidado para: ${slug}`);
console.log(`Editor privado nuevo: ${appUrl}/edit/${token}`);