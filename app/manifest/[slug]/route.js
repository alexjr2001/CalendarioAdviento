import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = await params;
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(slug)) {
    return NextResponse.json({ error: 'El calendario no es válido.' }, { status: 400 });
  }

  return NextResponse.json({
    id: `/c/${slug}`,
    name: 'Calendario de Adviento',
    short_name: 'Adviento',
    description: 'Un calendario de Adviento personalizado',
    start_url: `/c/${slug}`,
    scope: '/',
    display: 'standalone',
    background_color: '#081521',
    theme_color: '#123d2d',
    icons: [{
      src: '/shared/imgs/logo.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    }]
  }, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}