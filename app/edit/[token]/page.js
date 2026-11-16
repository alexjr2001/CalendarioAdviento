import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCalendarByEditorToken, getSignedMediaUrl } from '@/lib/calendar';
import { checkEditorRateLimit } from '@/lib/editor-security';
import { getDefaultSettings, getDesignDefinition } from '@/lib/designs';
import EditorForm from './editor-form';

export const dynamic = 'force-dynamic';

export default async function EditorPage({ params }) {
  const rateLimit = await checkEditorRateLimit(await headers());
  if (!rateLimit.allowed) notFound();

  const { token } = await params;
  const calendar = await getCalendarByEditorToken(token);
  if (!calendar) notFound();
  const designDefinition = getDesignDefinition(calendar.design);
  const settings = {
    ...getDefaultSettings(calendar.design),
    title: calendar.title,
    introText: calendar.intro_text,
    displayText: calendar.display_text,
    relationshipStartDate: calendar.relationship_start_date,
    ...(calendar.settings || {}),
    coverOrder: Array.isArray(calendar.settings?.coverOrder) ? calendar.settings.coverOrder : [1, 2, 3, 4, 5]
  };
  const media = await Promise.all((calendar.calendar_media || []).map(async item => ({
    ...item,
    url: await getSignedMediaUrl(item.storage_path)
  })));
  if (calendar.music_path && !media.some(item => item.slot_type === 'music')) {
    media.push({
      slot_type: 'music',
      slot_number: 0,
      media_type: 'audio',
      storage_path: calendar.music_path,
      caption: '',
      url: await getSignedMediaUrl(calendar.music_path)
    });
  }
  return <div className="editor-theme" data-design={calendar.design}><main className="editor-page"><p className="eyebrow">Editor privado · {designDefinition.label}</p><h1>Personaliza tu calendario</h1><p className="lead">Edita los campos disponibles y administra el contenido de cada puerta.</p><p className="lead"><a className="preview-test-link" href={`/c/${calendar.slug}?vorschau=1`} target="_blank" rel="noopener">Probar el calendario (vista previa; no se guarda nada)</a></p><EditorForm token={token} design={calendar.design} designLabel={designDefinition.label} fields={designDefinition.fields} settings={settings} media={media} /></main></div>;
}
