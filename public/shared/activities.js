const isCalendarDemo = !new URLSearchParams(window.location.search).get('calendar');
document.querySelectorAll('.buy-fab-group').forEach(group => {
  group.hidden = !isCalendarDemo;
});

window.calendarDataReady.then(calendarConfig => {
  setupScratch(calendarConfig);
});

function setupScratch(calendarConfig) {
  const section = document.getElementById('scratchSection');
  if (!section) return;
  section.hidden = !calendarConfig.scratchEnabled;
  if (!calendarConfig.scratchEnabled) return;

  document.getElementById('scratchTitle').textContent = calendarConfig.scratchTitle;
  document.querySelector('.scratch-hint').textContent = calendarConfig.scratchHint;
  document.querySelector('.scratchTitle span').textContent = calendarConfig.scratchEndText;

  const date = new Date(`${calendarConfig.relationshipStartDate}T00:00:00`);
  const values = Number.isNaN(date.getTime()) ? [0, 0, 0] : calculateRelationshipTime(date);
  const labels = ['Años', 'Meses', 'Días'];
  const cards = document.getElementById('scratchCards');
  cards.replaceChildren();

  values.forEach((value, index) => {
    const card = document.createElement('div');
    card.className = 'scratch-card';
    card.innerHTML = `<div class="scratch-value"><div><strong>${value}</strong><span>${labels[index]}</span></div></div><canvas class="scratch-canvas" aria-label="Rascar tarjeta ${index + 1}"></canvas>`;
    cards.appendChild(card);
    setupScratchCard(card);
  });
}

function addCalendarMonths(date, amount) {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

function calculateRelationshipTime(startDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let years = today.getFullYear() - startDate.getFullYear();
  let anniversary = addCalendarMonths(startDate, years * 12);
  if (anniversary > today) {
    years -= 1;
    anniversary = addCalendarMonths(startDate, years * 12);
  }
  let months = (today.getFullYear() - anniversary.getFullYear()) * 12 + today.getMonth() - anniversary.getMonth();
  let monthiversary = addCalendarMonths(anniversary, months);
  if (monthiversary > today) {
    months -= 1;
    monthiversary = addCalendarMonths(anniversary, months);
  }
  const days = Math.floor((today - monthiversary) / 86400000);
  return [years, months, days];
}

function setupScratchCard(card) {
  const canvas = card.querySelector('.scratch-canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let isScratching = false;
  let scratchedPixels = 0;

  function resizeCanvas() {
    const size = card.getBoundingClientRect().width;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const cover = context.createRadialGradient(size * .3, size * .2, 4, size * .7, size * .8, size);
    cover.addColorStop(0, '#f5f5f2');
    cover.addColorStop(.5, '#a6abad');
    cover.addColorStop(1, '#656d73');
    context.fillStyle = cover;
    context.fillRect(0, 0, size, size);
    context.fillStyle = 'rgba(255,255,255,.28)';
    context.font = '600 12px DM Sans';
    context.textAlign = 'center';
    context.fillText('RASCA', size / 2, size / 2 + 4);
  }

  function scratch(event) {
    if (!isScratching || card.classList.contains('revealed')) return;
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, 15, 0, Math.PI * 2);
    context.fill();
    scratchedPixels += 1;
    if (scratchedPixels > 12) card.classList.add('revealed');
  }

  canvas.addEventListener('pointerdown', event => {
    isScratching = true;
    try { canvas.setPointerCapture(event.pointerId); } catch { /* Synthetic events may not be capturable. */ }
    scratch(event);
  });
  canvas.addEventListener('pointermove', scratch);
  canvas.addEventListener('pointerup', () => {
    isScratching = false;
    if (scratchedPixels > 3) card.classList.add('revealed');
  });
  canvas.addEventListener('pointercancel', () => { isScratching = false; });
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

window.startCalendarGame = async (game, container, calendarConfig) => {
  if (!/^[a-z0-9-]+$/.test(game)) return;
  // Evita cargar el juego dos veces ante llamadas duplicadas, como un doble toque.
  const ticket = (container.gameTicket = (container.gameTicket || 0) + 1);
  try {
    const { default: mountGame } = await import(`/shared/games/${game}.js`);
    if (container.gameTicket !== ticket) return;
    if (typeof mountGame !== 'function') throw new Error('Game module has no mount function.');
    container.replaceChildren();
    mountGame(container, calendarConfig);
  } catch {
    if (container.gameTicket !== ticket) return;
    const message = document.createElement('p');
    message.className = 'game-load-error';
    message.textContent = 'No se pudo cargar este juego.';
    container.replaceChildren(message);
  }
};