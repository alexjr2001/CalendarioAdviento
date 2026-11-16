window.calendarDataReady.then(calendarConfig => {
window.addEventListener('storage', event => {
  if (event.key === 'advent-calendar-config') window.location.reload();
});
const isDemo = !new URLSearchParams(window.location.search).get('calendar');
const isPreview = !isDemo && new URLSearchParams(window.location.search).has('vorschau');
const currentYear = new Date().getFullYear();
const adventMonth = isDemo ? 9 : 11;
const adventStartDate = new Date(currentYear, adventMonth, 1);
const adventEndDate = new Date(currentYear, adventMonth, 24);
const adventMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(adventStartDate);
document.getElementById('yearLabel').textContent = `${adventMonthName} · ${currentYear}`;
const titleNode = document.querySelector('h1');
titleNode.replaceChildren();
calendarConfig.title.split('\n').forEach((line, index) => {
  if (index > 0) titleNode.appendChild(document.createElement('br'));
  titleNode.appendChild(document.createTextNode(line));
});
document.querySelector('.intro').textContent = calendarConfig.introText;

const defaultMemoryPhotos = [
  { src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=85' },
  { src: 'https://images.unsplash.com/photo-1543934638-bd2e138430c4?auto=format&fit=crop&w=800&q=85' },
  { src: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=85' },
  { src: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=85' },
  { src: 'https://images.unsplash.com/photo-1484665754804-74b091211472?auto=format&fit=crop&w=800&q=85' }
];
const mediaUrlCache = new WeakMap();
function toMediaUrl(source) {
  if (!(source instanceof Blob)) return source;
  if (!mediaUrlCache.has(source)) mediaUrlCache.set(source, URL.createObjectURL(source));
  return mediaUrlCache.get(source);
}
const memoryPhotos = (calendarConfig.coverPhotos.length ? calendarConfig.coverPhotos : defaultMemoryPhotos).map(photo => ({ src: toMediaUrl(typeof photo === 'string' ? photo : photo.src) }));
document.getElementById('memoryNames').textContent = calendarConfig.displayText;
let memoryPhotoIndex = 0;
const memoryPhoto = document.getElementById('memoryPhoto');
const memoryPrev = document.getElementById('memoryPrev');
const memoryNext = document.getElementById('memoryNext');
const memoryImage = document.getElementById('memoryImage');
memoryImage.addEventListener('load', () => memoryImage.classList.add('is-loaded'));
const memoryDots = document.getElementById('memoryDots');

memoryPhotos.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = 'memory-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.dataset.index = index;
  memoryDots.appendChild(dot);
});

function showMemoryPhoto(index, animate = false) {
  const photo = memoryPhotos[index];
  if (animate) memoryImage.classList.add('is-changing');
  setTimeout(() => {
    memoryImage.classList.remove('is-loaded');
    memoryImage.src = photo.src;
    memoryImage.alt = `Foto de recuerdo ${index + 1}`;
    memoryDots.querySelectorAll('.memory-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
    memoryImage.classList.remove('is-changing');
  }, animate ? 450 : 0);
}

showMemoryPhoto(memoryPhotoIndex);
memoryPhoto.addEventListener('click', () => {
  memoryPhotoIndex = (memoryPhotoIndex + 1) % memoryPhotos.length;
  showMemoryPhoto(memoryPhotoIndex, true);
});
memoryPrev.addEventListener('click', () => {
  memoryPhotoIndex = (memoryPhotoIndex - 1 + memoryPhotos.length) % memoryPhotos.length;
  showMemoryPhoto(memoryPhotoIndex, true);
});
memoryNext.addEventListener('click', () => {
  memoryPhotoIndex = (memoryPhotoIndex + 1) % memoryPhotos.length;
  showMemoryPhoto(memoryPhotoIndex, true);
});

const doorSpans = ['n', 'n', 'w', 'n', 't', 'n', 'n', 'w', 'n', 'n', 't', 'n', 'n', 'n', 'w', 'n', 't', 'n', 'n', 'w', 'n', 'n', 'n', 't'];
const gifts = calendarConfig.gifts.map((gift, index) => ({ ...gift, day: index + 1, src: toMediaUrl(gift.src) }));
const doorOrder = Array.isArray(calendarConfig.doorOrder) && calendarConfig.doorOrder.length === 24 ? calendarConfig.doorOrder : null;
const orderedGifts = doorOrder ? doorOrder.map(day => gifts[day - 1]) : gifts;

const calendar = document.getElementById('calendar');
const today = new Date();
today.setHours(0, 0, 0, 0);
const opened = JSON.parse(localStorage.getItem('advent-opened') || '[]');

for (const gift of orderedGifts) {
  const unlockDate = new Date(currentYear, adventMonth, gift.day);
  const unlocked = isDemo || isPreview || today >= unlockDate;
  const available = unlocked && Boolean(gift.game || gift.src) && (!isDemo || gift.day <= 2);
  const span = doorSpans[(gift.day - 1) % doorSpans.length];
  const spanClass = span === 'w' ? 'door-span-wide' : span === 't' ? 'door-span-tall' : 'door-span-normal';
  const door = document.createElement('button');
  door.className = `door ${spanClass}${opened.includes(gift.day) ? ' is-open' : ''}`;
  door.type = 'button';
  door.disabled = !available;
  door.setAttribute('aria-label', available ? `Abrir el regalo del ${gift.day} de ${adventMonthName}` : unlocked ? `Día ${gift.day}, aún no hay contenido` : `Día ${gift.day}, se desbloquea el ${gift.day} de ${adventMonthName}`);
  door.innerHTML = `<span class="lock">${unlocked ? '✦' : '⌁'}</span><span class="number">${String(gift.day).padStart(2, '0')}</span><span class="door-label">${unlocked ? 'abrir' : 'bloqueado'}</span>`;
  if (available) door.addEventListener('click', () => openGift(gift, door));
  calendar.appendChild(door);
}

const status = document.getElementById('status');
if (isDemo) {
  status.textContent = 'En esta demostración solo se abren las puertas 01 y 02.';
} else if (isPreview) {
  status.textContent = 'Vista previa: todas las puertas están abiertas. No se guarda ningún cambio.';
} else if (today < adventStartDate) {
  status.textContent = `La primera puerta se abrirá el 1 de ${adventMonthName}.`;
} else if (today > adventEndDate) {
  status.textContent = `Después del 24 de ${adventMonthName} podrás abrir todas las puertas.`;
} else {
  status.textContent = `Hoy puedes abrir la puerta número ${String(today.getDate()).padStart(2, '0')}.`;
}

function openGift(gift, door) {
  if (!isDemo && !isPreview) door.classList.add('is-open');
  if (!isDemo && !isPreview && !opened.includes(gift.day)) { opened.push(gift.day); localStorage.setItem('advent-opened', JSON.stringify(opened)); }
  document.getElementById('modalKicker').textContent = `Día ${String(gift.day).padStart(2, '0')}`;
  document.getElementById('modalTitle').textContent = `Puerta ${String(gift.day).padStart(2, '0')}`;
  document.getElementById('modalText').textContent = gift.caption || '';
  document.getElementById('modalText').hidden = !gift.caption;
  const mediaSlot = document.getElementById('mediaSlot');
  mediaSlot.replaceChildren();
  if (gift.game) {
    window.startCalendarGame(gift.game, mediaSlot, calendarConfig);
  } else if (gift.type === 'video') {
    const video = document.createElement('video');
    video.className = 'gift-media';
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.src = gift.src;
    mediaSlot.appendChild(video);
  } else if (gift.type === 'audio') {
    const audioPlayer = document.createElement('audio');
    audioPlayer.className = 'gift-media';
    audioPlayer.controls = true;
    audioPlayer.autoplay = true;
    audioPlayer.src = gift.src;
    mediaSlot.appendChild(audioPlayer);
  } else {
    const image = document.createElement('img');
    image.className = 'gift-media';
    image.src = gift.src;
    image.alt = `Regalo del ${gift.day} de diciembre`;
    mediaSlot.appendChild(image);
  }
  document.getElementById('modalBackdrop').classList.add('visible');
  launchConfetti();
  startMusic();
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('visible');
  document.getElementById('mediaSlot').innerHTML = '';
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', event => { if (event.target.id === 'modalBackdrop') closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

const snow = document.getElementById('snow');
const snowflakeGlyphs = ['❄', '❅', '❆'];
for (let i = 0; i < 140; i += 1) {
  const flake = document.createElement('i');
  const size = Math.random() * 5 + 6;
  flake.className = 'flake';
  flake.textContent = snowflakeGlyphs[Math.floor(Math.random() * snowflakeGlyphs.length)];
  flake.style.cssText = `left:${Math.random() * 100}%;font-size:${size}px;animation-duration:${Math.random() * 9 + 8}s;animation-delay:-${Math.random() * 15}s;--drift:${Math.random() * 100 - 50}px`;
  snow.appendChild(flake);
}

const christmasMusic = document.getElementById('christmasMusic');
const christmasMusicSource = christmasMusic.querySelector('source');
if (calendarConfig.music) christmasMusicSource.src = toMediaUrl(calendarConfig.music);
else christmasMusicSource.removeAttribute('src');
document.getElementById('soundToggle').hidden = !calendarConfig.music;
christmasMusic.load();
const audio = { active: false };

function startMusic() {
  if (!calendarConfig.music || audio.active) return;
  audio.active = true;
  christmasMusic.play().catch(() => { audio.active = false; updateSoundButton(); });
  updateSoundButton();
}

function stopMusic() {
  audio.active = false;
  christmasMusic.pause();
  updateSoundButton();
}

function updateSoundButton() {
  const button = document.getElementById('soundToggle');
  button.textContent = audio.active ? '♫ Desactivar música' : '♫ Activar música';
}

document.getElementById('soundToggle').addEventListener('click', () => { if (audio.active) stopMusic(); else startMusic(); });

function launchConfetti() {
  const canvas = document.getElementById('confetti');
  const context = canvas.getContext('2d');
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const pieces = Array.from({ length: 100 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.36, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4, size: Math.random() * 7 + 3, color: ['#C9D8E8', '#8fb3d9', '#F7F5F0', '#4a6c96'][Math.floor(Math.random() * 4)], life: 1 }));
  function frame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(piece => { piece.x += piece.vx; piece.y += piece.vy; piece.vy += 0.35; piece.life -= 0.012; context.globalAlpha = Math.max(piece.life, 0); context.fillStyle = piece.color; context.fillRect(piece.x, piece.y, piece.size, piece.size * 0.55); });
    if (pieces.some(piece => piece.life > 0)) requestAnimationFrame(frame); else context.clearRect(0, 0, canvas.width, canvas.height);
  }
  frame();
}

const holidayDecor = document.getElementById('holidayDecor');
const decorGlyphs = ['❄', '❅', '❆'];
function layoutHolidayDecor() {
  const pageHeight = document.body.scrollHeight;
  holidayDecor.style.height = `${pageHeight}px`;
  holidayDecor.replaceChildren();
  const spacing = 26;
  const count = Math.max(80, Math.round(pageHeight / spacing));
  for (let i = 0; i < count; i += 1) {
    const icon = document.createElement('span');
    icon.className = 'decor-item';
    icon.textContent = decorGlyphs[i % decorGlyphs.length];
    icon.style.left = `${Math.random() * 96}%`;
    icon.style.top = `${Math.random() * pageHeight}px`;
    icon.style.fontSize = `${Math.random() * 70 + 26}px`;
    icon.style.opacity = `${Math.random() * 0.55 + 0.15}`;
    icon.style.transform = `rotate(${Math.random() * 28 - 14}deg)`;
    holidayDecor.appendChild(icon);
  }
}
layoutHolidayDecor();
window.addEventListener('resize', layoutHolidayDecor);
document.body.classList.add('is-ready');
});
