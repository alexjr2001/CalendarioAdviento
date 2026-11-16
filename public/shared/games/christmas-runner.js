const width = 640;
const height = 220;
const ground = 176;
const gravity = 2300;
const jumpSpeed = 700;
const baseSpeed = 300;
const maxSpeed = 720;
const acceleration = 8;
const playerX = 60;

const groundObstacles = [
  { emoji: '⛄', size: 38, w: 26, h: 34 },
  { emoji: '🎄', size: 40, w: 24, h: 36 },
  { emoji: '🎁', size: 28, w: 24, h: 24 },
  { emoji: '🎁🎁', size: 28, w: 48, h: 24 },
  { emoji: '🎄🎄', size: 40, w: 50, h: 36 }
];
const bird = { emoji: '🕊️', size: 30, w: 30, h: 18, lift: 26 };

const keysJump = ['ArrowUp', ' ', 'w', 'W'];
const keysDuck = ['ArrowDown', 's', 'S'];

function random(min, max) {
  return min + Math.random() * (max - min);
}

export default function mountChristmasRunner(container) {
  const section = document.createElement('section');
  section.className = 'runner-section activity-section';
  section.innerHTML = '<p class="runner-eyebrow">Juego navideño</p><h2>Carrera de renos</h2>'
    + '<div class="runner-game"><p class="runner-intro">Salta sobre muñecos de nieve, árboles y regalos, y agáchate para pasar bajo las palomas. Usa la barra espaciadora o ↑ para saltar y ↓ para agacharte, o toca los botones.</p><div class="runner-bar"><span class="runner-score">0</span><span class="runner-best"></span></div><div class="runner-arena"><canvas class="runner-canvas" width="640" height="220" aria-label="Zona de juego"></canvas><div class="runner-rotate" hidden><span class="runner-rotate-icon">📱</span><p>Gira el teléfono a posición horizontal</p></div></div><div class="runner-pad"><button class="runner-jump" type="button">⬆ Saltar</button><button class="runner-duck" type="button">⬇ Agacharse</button></div></div>'
    + '<div class="runner-result" aria-live="polite" hidden><p class="runner-result-title">¡Juego terminado!</p><p class="runner-result-score"></p><p class="runner-result-note"></p><button class="runner-again" type="button">Jugar otra vez</button></div>';
  container.appendChild(section);

  const canvas = section.querySelector('.runner-canvas');
  const ctx = canvas.getContext('2d');
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const scoreEl = section.querySelector('.runner-score');
  const bestEl = section.querySelector('.runner-best');
  const game = section.querySelector('.runner-game');
  const result = section.querySelector('.runner-result');
  const resultScore = section.querySelector('.runner-result-score');
  const resultNote = section.querySelector('.runner-result-note');
  const againButton = section.querySelector('.runner-again');
  const jumpButton = section.querySelector('.runner-jump');
  const duckButton = section.querySelector('.runner-duck');
  const rotateNote = section.querySelector('.runner-rotate');

  function isPortraitPhone() {
    return window.matchMedia('(pointer: coarse)').matches && window.innerHeight > window.innerWidth;
  }

  function syncOrientation() {
    const portrait = isPortraitPhone();
    rotateNote.hidden = !portrait;
    if (portrait && state === 'running') {
      state = 'paused';
      window.cancelAnimationFrame(frameId);
    } else if (!portrait) {
      // Tras girar, el layout tarda un instante: centrar cuando ya está estable
      window.setTimeout(() => canvas.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      if (state === 'paused') {
        state = 'running';
        last = performance.now();
        frameId = window.requestAnimationFrame(frame);
      }
    }
  }

  window.addEventListener('resize', syncOrientation);
  window.addEventListener('orientationchange', syncOrientation);

  let state = 'ready';
  let frameId = 0;
  let last = 0;
  let elapsed = 0;
  let distance = 0;
  let speed = baseSpeed;
  let lift = 0;
  let velocity = 0;
  let ducking = false;
  let obstacles = [];
  let spawnIn = 0;
  let score = 0;
  let best = 0;
  let snow = Array.from({ length: 28 }, () => ({ x: random(0, width), y: random(0, ground), r: random(1, 2.4), v: random(10, 40) }));

  function playerBox() {
    const boxHeight = ducking && lift === 0 ? 18 : 32;
    return { x: playerX + 6, y: ground - lift - boxHeight, w: 26, h: boxHeight };
  }

  function obstacleBox(obstacle) {
    return { x: obstacle.x + 2, y: ground - obstacle.lift - obstacle.h, w: obstacle.w - 4, h: obstacle.h };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function jump() {
    if (state === 'ready') start();
    if (state !== 'running' || lift > 0) return;
    velocity = jumpSpeed;
    ducking = false;
  }

  function spawn() {
    const useBird = score >= 100 && Math.random() < 0.3;
    const type = useBird ? bird : groundObstacles[Math.floor(Math.random() * groundObstacles.length)];
    obstacles.push({ ...type, x: width + 20, lift: useBird ? bird.lift : 0 });
    spawnIn = speed * random(0.8, 1.5) + type.w;
  }

  function update(dt) {
    elapsed += dt;
    speed = Math.min(maxSpeed, baseSpeed + elapsed * acceleration);
    distance += speed * dt;
    score = Math.floor(distance / 12);

    if (lift > 0 || velocity > 0) {
      velocity -= gravity * (ducking ? 2.2 : 1) * dt;
      lift += velocity * dt;
      if (lift <= 0) {
        lift = 0;
        velocity = 0;
      }
    }

    spawnIn -= speed * dt;
    if (spawnIn <= 0) spawn();
    obstacles.forEach(obstacle => { obstacle.x -= speed * dt; });
    obstacles = obstacles.filter(obstacle => obstacle.x > -80);
    snow.forEach(flake => {
      flake.x -= (speed * 0.15 + flake.v) * dt;
      flake.y += flake.v * dt;
      if (flake.x < 0) flake.x = width;
      if (flake.y > ground) flake.y = 0;
    });

    const box = playerBox();
    if (obstacles.some(obstacle => overlaps(box, obstacleBox(obstacle)))) gameOver();
  }

  function draw(message = '') {
    ctx.fillStyle = '#13293b';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    snow.forEach(flake => {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#e9f1f7';
    ctx.fillRect(0, ground, width, height - ground);
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fillRect(0, ground, width, 3);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#000';
    obstacles.forEach(obstacle => {
      ctx.font = `${obstacle.size}px sans-serif`;
      ctx.fillText(obstacle.emoji, obstacle.x, ground - obstacle.lift + 2);
    });

    const crouch = ducking && lift === 0;
    ctx.font = `${crouch ? 30 : 40}px sans-serif`;
    ctx.save();
    ctx.translate(playerX + 38, 0);
    ctx.scale(-1, 1);
    ctx.fillText('🦌', 0, ground - lift + 3);
    ctx.restore();

    if (message) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '600 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(message, width / 2, 90);
    }
  }

  function renderScore() {
    scoreEl.textContent = `Puntos: ${score}`;
    bestEl.textContent = best ? `Récord: ${best}` : '';
  }

  function frame(now) {
    if (state !== 'running') return;
    if (!section.isConnected) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    if (state !== 'running') return;
    draw();
    renderScore();
    frameId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (state === 'running') return;
    if (isPortraitPhone()) {
      rotateNote.hidden = false;
      return;
    }
    state = 'running';
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    last = performance.now();
    frameId = window.requestAnimationFrame(frame);
  }

  function gameOver() {
    state = 'over';
    window.cancelAnimationFrame(frameId);
    const record = score > best;
    best = Math.max(best, score);
    draw();
    renderScore();
    resultScore.textContent = score;
    resultNote.textContent = record && score > 0 ? '¡Nuevo récord!' : `Récord: ${best}`;
    window.setTimeout(() => {
      if (state !== 'over') return;
      game.hidden = true;
      result.hidden = false;
      if (record && score >= 200) window.launchConfetti?.();
      againButton.focus();
    }, 700);
  }

  function reset() {
    window.cancelAnimationFrame(frameId);
    state = 'ready';
    elapsed = 0;
    distance = 0;
    speed = baseSpeed;
    lift = 0;
    velocity = 0;
    ducking = false;
    obstacles = [];
    spawnIn = 0;
    score = 0;
    game.hidden = false;
    result.hidden = true;
    renderScore();
    draw('Pulsa la barra espaciadora o toca para empezar');
  }

  function onKeyDown(event) {
    if (!section.isConnected || game.hidden) return;
    const jumpKey = keysJump.includes(event.key);
    const duckKey = keysDuck.includes(event.key);
    if (!jumpKey && !duckKey) return;
    if (state !== 'running' && !section.contains(document.activeElement)) return;
    event.preventDefault();
    if (jumpKey) jump();
    if (duckKey) ducking = true;
  }

  function onKeyUp(event) {
    if (keysDuck.includes(event.key)) ducking = false;
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  canvas.addEventListener('pointerdown', event => {
    event.preventDefault();
    jump();
  });
  jumpButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    jump();
  });
  duckButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (state === 'ready') start();
    ducking = true;
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => {
    duckButton.addEventListener(type, () => { ducking = false; });
  });
  againButton.addEventListener('click', reset);
  reset();
}
