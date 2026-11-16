import { NextResponse } from 'next/server';
import { getCalendarBySlug, getSignedMediaUrl } from '@/lib/calendar';
import { getDefaultSettings } from '@/lib/designs';

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const calendar = await getCalendarBySlug(slug);
    if (!calendar) return NextResponse.json({ error: 'No se encontró el calendario.' }, { status: 404 });

    const media = await Promise.all((calendar.calendar_media || [])
      .map(async item => ({
        slotType: item.slot_type,
        slotNumber: item.slot_number,
        mediaType: item.media_type,
        caption: item.caption || '',
        url: await getSignedMediaUrl(item.storage_path)
      })));
    const music = media.find(item => item.slotType === 'music')?.url
      || await getSignedMediaUrl(calendar.music_path);
    const settings = {
      ...getDefaultSettings(calendar.design),
      ...(calendar.settings || {}),
      title: calendar.settings?.title ?? calendar.title,
      introText: calendar.settings?.introText ?? calendar.intro_text,
      displayText: calendar.settings?.displayText ?? calendar.display_text,
      relationshipStartDate: calendar.settings?.relationshipStartDate ?? calendar.relationship_start_date,
      coverOrder: Array.isArray(calendar.settings?.coverOrder) ? calendar.settings.coverOrder : [1, 2, 3, 4, 5]
    };

    return NextResponse.json({
      slug: calendar.slug,
      settings: {
        ...settings,
        music
      },
      media
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el calendario.' }, { status: 500 });
  }
}