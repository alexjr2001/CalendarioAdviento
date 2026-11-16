const grid = 16;
const cell = 20;
const startDelay = 176;
const minDelay = 83;
const foods = ['🎁', '🍬', '🍪', '⭐', '🎄', '🔔'];
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
const keyMap = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
};

export default function mountChristmasSnake(container) {
  const section = document.createElement('section');
  section.className = 'snake-section activity-section';
  section.innerHTML = '<p class="snake-eyebrow">Juego navideño</p><h2>Serpiente de caramelos</h2>'
    + '<div class="snake-game"><p class="snake-intro">Recoge regalos y dulces para que crezca la serpiente. No choques contra la pared ni contigo misma. Controles: flechas, WASD, deslizar el dedo o los botones de abajo.</p><div class="snake-bar"><span class="snake-score">Puntos: 0</span><span class="snake-best"></span></div><canvas class="snake-canvas" width="320" height="320" aria-label="Zona de juego"></canvas><div class="snake-pad"><button type="button" data-dir="up" aria-label="Arriba">▲</button><button type="button" data-dir="left" aria-label="Izquierda">◀</button><button type="button" data-dir="down" aria-label="Abajo">▼</button><button type="button" data-dir="right" aria-label="Derecha">▶</button></div><button class="snake-start" type="button">Empezar</button></div>'
    + '<div class="snake-result" aria-live="polite" hidden><p class="snake-result-title">¡Juego terminado!</p><p class="snake-result-score"></p><p class="snake-result-note"></p><button class="snake-again" type="button">Jugar otra vez</button></div>';
  container.appendChild(section);

  const canvas = section.querySelector('.snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = section.querySelector('.snake-score');
  const bestEl = section.querySelector('.snake-best');
  const startButton = section.querySelector('.snake-start');
  const result = section.querySelector('.snake-result');
  const resultScore = section.querySelector('.snake-result-score');
  const resultNote = section.querySelector('.snake-result-note');
  const againButton = section.querySelector('.snake-again');

  let snake = [];
  let direction = directions.right;
  let queued = [];
  let food = { x: 0, y: 0, emoji: foods[0] };
  let score = 0;
  let eaten = 0;
  let best = 0;
  let running = false;
  let timer = 0;

  function delay() {
    return Math.max(minDelay, startDelay - eaten * 4.4);
  }

  function placeFood() {
    const free = [];
    for (let y = 0; y < grid; y += 1) {
      for (let x = 0; x < grid; x += 1) {
        if (!snake.some(part => part.x === x && part.y === y)) free.push({ x, y });
      }
    }
    if (!free.length) return false;
    const spot = free[Math.floor(Math.random() * free.length)];
    food = { ...spot, emoji: foods[Math.floor(Math.random() * foods.length)] };
    return true;
  }

  function draw() {
    for (let y = 0; y < grid; y += 1) {
      for (let x = 0; x < grid; x += 1) {
        ctx.fillStyle = (x + y) % 2 ? '#1d3a2b' : '#21412f';
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${cell - 3}px sans-serif`;
    ctx.fillText(food.emoji, food.x * cell + cell / 2, food.y * cell + cell / 2 + 1);
    for (let index = snake.length - 1; index >= 0; index -= 1) {
      const part = snake[index];
      ctx.fillStyle = index % 2 ? '#f7f1e8' : '#c8323f';
      ctx.beginPath();
      ctx.roundRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2, 5);
      ctx.fill();
    }
    const head = snake[0];
    ctx.fillText('🎅', head.x * cell + cell / 2, head.y * cell + cell / 2 + 1);
  }

  function renderScore() {
    scoreEl.textContent = `Puntos: ${score}`;
    bestEl.textContent = best ? `Récord: ${best}` : '';
  }

  function tick() {
    if (queued.length) direction = queued.shift();
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitsWall = head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid;
    const willGrow = head.x === food.x && head.y === food.y;
    const body = willGrow ? snake : snake.slice(0, -1);
    if (hitsWall || body.some(part => part.x === head.x && part.y === head.y)) {
      end();
      return;
    }
    snake.unshift(head);
    if (willGrow) {
      eaten += 1;
      score += 10;
      renderScore();
      if (!placeFood()) {
        draw();
        end();
        return;
      }
    } else {
      snake.pop();
    }
    draw();
    timer = window.setTimeout(tick, delay());
  }

  function end() {
    running = false;
    window.clearTimeout(timer);
    best = Math.max(best, score);
    resultScore.textContent = score;
    resultNote.textContent = `Recogiste ${eaten} ${eaten === 1 ? 'dulce' : 'dulces'} · Longitud ${snake.length}${score >= best && score > 0 ? ' · ¡Nuevo récord!' : ''}`;
    section.querySelector('.snake-game').hidden = true;
    result.hidden = false;
    renderScore();
    if (score >= 100) window.launchConfetti?.();
    againButton.focus();
  }

  function reset(focusStart = false) {
    window.clearTimeout(timer);
    snake = [{ x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }];
    direction = directions.right;
    queued = [];
    score = 0;
    eaten = 0;
    running = false;
    placeFood();
    renderScore();
    draw();
    section.querySelector('.snake-game').hidden = false;
    result.hidden = true;
    startButton.hidden = false;
    if (focusStart) startButton.focus();
  }

  function start() {
    if (running) return;
    running = true;
    startButton.hidden = true;
    timer = window.setTimeout(tick, delay());
  }

  function turn(name) {
    if (!running) return;
    const next = directions[name];
    const last = queued.length ? queued[queued.length - 1] : direction;
    if (next.x === -last.x && next.y === -last.y) return;
    if (next === last || queued.length >= 2) return;
    queued.push(next);
  }

  function onKey(event) {
    const name = keyMap[event.key];
    if (!name || !section.isConnected || section.querySelector('.snake-game').hidden) return;
    if (!running && !section.contains(document.activeElement)) return;
    event.preventDefault();
    if (!running) start();
    turn(name);
  }

  document.addEventListener('keydown', onKey);

  let touchStart = null;
  canvas.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (!running) start();
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  });

  section.querySelectorAll('[data-dir]').forEach(button => {
    button.addEventListener('click', () => {
      if (!running) start();
      turn(button.dataset.dir);
    });
  });
  startButton.addEventListener('click', start);
  againButton.addEventListener('click', () => reset(true));
  reset();
}
