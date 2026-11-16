import { createHash, randomBytes } from 'node:crypto';
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { designDefinitions, getDefaultSettings } from '../lib/designs/index.js';
import { calendarGames } from '../lib/game-catalog.js';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const slug = process.argv[2]?.toLowerCase();
const design = process.argv[3] || 'design1';
if (!slug || !/^[a-z0-9][a-z0-9-]{1,62}$/.test(slug)) {
  console.error(`Uso: npm run calendar:create -- <slug> <${Object.keys(designDefinitions).join('|')}>`);
  process.exit(1);
}
if (!Object.hasOwn(designDefinitions, design)) {
  console.error(`Diseño desconocido. Disponibles: ${Object.keys(designDefinitions).join(', ')}`);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.');
  process.exit(1);
}

const token = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(token).digest('hex');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 24 puertas, juego fijo por puerta y sin repetir; Pac-Man queda solo para asignar a mano.
const presetGames = calendarGames.filter(game => game.id !== 'christmas-pacman');

const settings = getDefaultSettings(design);
settings.relationshipStartDate = new Date().toISOString().slice(0, 10);
settings.giftGames = Object.fromEntries(Array.from({ length: 24 }, (_, index) => [index + 1, presetGames[index].id]));
const tokenExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

const { error } = await supabase.from('calendars').insert({
  slug,
  editor_token_hash: tokenHash,
  editor_token_expires_at: tokenExpiresAt,
  design,
  settings,
  title: settings.title,
  intro_text: settings.introText,
  display_text: settings.displayText,
  relationship_start_date: settings.relationshipStartDate
});

if (error) {
  console.error(`No se pudo crear el calendario: ${error.message}`);
  process.exit(1);
}

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
console.log(`Calendario creado: ${slug}`);
console.log(`Página pública: ${appUrl}/c/${slug}`);
console.log(`Editor privado: ${appUrl}/edit/${token}`);