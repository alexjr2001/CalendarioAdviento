import { notFound, redirect } from 'next/navigation';
import { getCalendarBySlug } from '@/lib/calendar';
import { getDesignDefinition, hasDesignDefinition } from '@/lib/designs';

export const dynamic = 'force-dynamic';

export default async function PublicCalendarRoute({ params, searchParams }) {
  const { slug } = await params;
  const calendar = await getCalendarBySlug(slug);
  if (!calendar) notFound();
  if (!hasDesignDefinition(calendar.design)) notFound();
  const design = getDesignDefinition(calendar.design);
  const query = new URLSearchParams({ calendar: calendar.slug });
  const { vorschau } = await searchParams;
  if (vorschau !== undefined) query.set('vorschau', vorschau);
  redirect(`${design.publicPath}?${query.toString()}`);
}