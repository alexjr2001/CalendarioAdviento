const site = window.CALENDAR_SITE || {};
const defaults = {
  title: '24 sorpresas\npara nuestra familia.',
  introText: 'Una pequeña tradición para quienes comparten momentos. Abre una puerta cada día y descubran juntos algo especial.',
  displayText: 'Familia García',
  relationshipStartDate: '2022-01-24',
  scratchEnabled: false,
  scratchTitle: 'Fueron los momentos más bonitos...',
  scratchHint: 'Rasca los círculos para descubrirlo',
  scratchEndText: 'de mi vida.',
  puzzleImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=85',
  coverOrder: [1, 2, 3, 4, 5],
  coverPhotos: [],
  gifts: Array.from({ length: 24 }, (_, index) => ({ type: 'image', src: '', caption: '', game: ['memory', 'kniffel'][index] || '' })),
  music: site.music || ''
};

window.calendarDataReady = (async () => {
  if (!site.apiBaseUrl || !site.slug) return defaults;
  try {
    const response = await fetch(`${site.apiBaseUrl.replace(/\/+$/, '')}/api/public/${encodeURIComponent(site.slug)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Calendar API returned ${response.status}`);
    const calendar = await response.json();
    const media = calendar.media || [];
    const coverOrder = calendar.settings?.coverOrder || defaults.coverOrder;
    return {
      ...defaults,
      ...calendar.settings,
      music: calendar.settings?.music ?? defaults.music,
      puzzleImage: media.find(item => item.slotType === 'puzzle')?.url || defaults.puzzleImage,
      coverOrder,
      coverPhotos: media.filter(item => item.slotType === 'cover').sort((a, b) => coverOrder.indexOf(a.slotNumber) - coverOrder.indexOf(b.slotNumber)).map(item => item.url),
      gifts: Array.from({ length: 24 }, (_, index) => {
        const item = media.find(entry => entry.slotType === 'gift' && entry.slotNumber === index + 1);
        return { type: item?.mediaType || 'image', src: item?.url || '', caption: item?.caption || '', game: calendar.settings?.giftGames?.[index + 1] || '' };
      })
    };
  } catch (error) {
    console.error('Could not load this calendar from the editor service.', error);
    return defaults;
  }
})();
