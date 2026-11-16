const calendarSlug = new URLSearchParams(window.location.search).get('calendar');
window.CALENDAR_SITE = {
  slug: calendarSlug || 'design3',
  apiBaseUrl: window.location.origin,
  names: 'Familia García',
  relationshipStartDate: '2022-01-24'
};

// Only offer "Add to Home Screen" when accessed via a real /c/<slug> link, not the raw design preview
if (calendarSlug) {
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = `/manifest/${encodeURIComponent(calendarSlug)}`;
  document.head.appendChild(manifestLink);
}
