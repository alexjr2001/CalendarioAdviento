const gifts = ['🎁', '🍬', '🎄', '⭐', '🔔', '🧦', '🍪', '🕯️'];
const obstacles = ['⚓', '🗿', '🖤'];
const gameDuration = 30000;

function randomNumber(min, max) {
  return min + Math.random() * (max - min);
}

export default function mountSackCatch(container) {
  const section = document.createElement('section');
  section.className = 'sack-catch-section activity-section';
  section.innerHTML = '<p class="sack-catch-eyebrow">Una nevada llena de sorpresas</p><h2>Atrapa los regalos</h2><p class="sack-catch-intro">Mueve el saco de Papá Noel hacia los lados. Atrapa los regalos, pero deja caer los yunques pesados.</p><div class="sack-catch-hud"><span class="sack-catch-time"></span><span class="sack-catch-score"></span></div><div class="sack-catch-arena" role="application" aria-label="Mover el saco hacia los lados"><div class="sack-catch-clouds" aria-hidden="true"></div><div class="sack-catch-player" aria-label="Saco de Papá Noel">🎅</div><button class="sack-catch-start" type="button">Empezar ronda</button><p class="sack-catch-status" aria-live="polite">Prepárate: los regalos caen rápidamente.</p></div><button class="sack-catch-new" type="button" hidden>Nueva ronda</button>';
  container.appendChild(section);

  const timeNode = section.querySelector('.sack-catch-time');
  const scoreNode = section.querySelector('.sack-catch-score');
  const arena = section.querySelector('.sack-catch-arena');
  const player = section.querySelector('.sack-catch-player');
  const startButton = section.querySelector('.sack-catch-start');
  const status = section.querySelector('.sack-catch-status');
  const newButton = section.querySelector('.sack-catch-new');
  let score = 0;
  let playerX = 50;
  let running = false;
  let startedAt = 0;
  let spawnTimer = null;
  let tickTimer = null;
  let fallers = [];

  function arenaWidth() {
    return arena.clientWidth;
  }

  function updateHud(remaining = gameDuration) {
    timeNode.textContent = `${Math.ceil(remaining / 1000)} s`;
    scoreNode.textContent = `Puntos: ${score}`;
  }

  function renderPlayer() {
    player.style.left = `${playerX}%`;
  }

  function movePlayer(delta) {
    playerX = Math.max(8, Math.min(92, playerX + delta));
    renderPlayer();
  }

  function moveToPointer(clientX) {
    const rect = arena.getBoundingClientRect();
    playerX = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    renderPlayer();
  }

  function spawnFallingItem() {
    if (!running) return;
    const elapsed = Date.now() - startedAt;
    const difficulty = elapsed / gameDuration;
    const isObstacle = Math.random() < .18 + difficulty * .08;
    const item = document.createElement('div');
    item.className = `sack-catch-item${isObstacle ? ' is-obstacle' : ''}`;
    item.textContent = isObstacle ? obstacles[Math.floor(Math.random() * obstacles.length)] : gifts[Math.floor(Math.random() * gifts.length)];
    item.style.left = `${randomNumber(5, 95)}%`;
    arena.appendChild(item);
    const life = randomNumber(950, 1450) - difficulty * 340;
    const endAt = Date.now() + Math.max(420, life);
    const endY = arena.clientHeight - 36;
    const entry = { node: item, x: Number.parseFloat(item.style.left), y: -38, speed: randomNumber(3.8, 5.2) + difficulty * 2.6, isObstacle };
    fallers.push(entry);
    item.style.transform = `translate(-50%,${entry.y}px)`;
  }

  function collideWithPlayer(entry) {
    const playerBounds = player.getBoundingClientRect();
    const itemBounds = entry.node.getBoundingClientRect();
    return itemBounds.bottom >= playerBounds.top && itemBounds.top <= playerBounds.bottom && itemBounds.right >= playerBounds.left && itemBounds.left <= playerBounds.right;
  }

  function clearItem(entry) {
    entry.node.remove();
    fallers = fallers.filter(item => item !== entry);
  }

  function updateItems() {
    const height = arena.clientHeight;
    fallers.forEach(entry => {
      entry.y += entry.speed;
      entry.node.style.transform = `translate(-50%,${entry.y}px)`;
      if (collideWithPlayer(entry)) {
        if (entry.isObstacle) {
          score = Math.max(0, score - 1);
          status.textContent = 'Cayó un yunque en el saco. Pierdes un punto.';
        } else {
          score += 1;
          status.textContent = `¡Recogiste ${entry.node.textContent}!`;
        }
        updateHud();
        clearItem(entry);
        return;
      }
      if (entry.y >= height - 34) clearItem(entry);
    });
  }

  function endGame() {
    running = false;
    window.clearTimeout(spawnTimer);
    window.clearInterval(tickTimer);
    fallers.forEach(entry => entry.node.remove());
    fallers = [];
    section.classList.add('is-complete');
    startButton.hidden = true;
    newButton.hidden = false;
    status.textContent = score > 0 ? `¡Listo! Recogiste ${score} regalos.` : 'Terminó la ronda. ¡Inténtalo de nuevo!';
    if (score >= 8) window.launchConfetti?.();
  }

  function tick() {
    const elapsed = Date.now() - startedAt;
    const remaining = gameDuration - elapsed;
    if (remaining <= 0) {
      endGame();
      return;
    }
    updateHud(remaining);
    updateItems();
  }

  function startGame() {
    score = 0;
    playerX = 50;
    running = true;
    startedAt = Date.now();
    section.classList.remove('is-complete');
    startButton.hidden = true;
    newButton.hidden = true;
    status.textContent = 'Mantén el saco debajo de los regalos.';
    arena.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateHud();
    renderPlayer();
    tickTimer = window.setInterval(tick, 16);
    spawnTimer = window.setTimeout(function spawn() {
      if (!running) return;
      spawnFallingItem();
      const difficulty = (Date.now() - startedAt) / gameDuration;
      spawnTimer = window.setTimeout(spawn, Math.max(240, randomNumber(360, 620) - difficulty * 240));
    }, 140);
  }

  startButton.addEventListener('click', startGame);
  newButton.addEventListener('click', startGame);
  arena.addEventListener('pointermove', event => {
    if (!running) return;
    moveToPointer(event.clientX);
  });
  arena.addEventListener('pointerdown', event => {
    if (!running) return;
    moveToPointer(event.clientX);
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
      event.preventDefault();
      movePlayer(-4);
    }
    if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
      event.preventDefault();
      movePlayer(4);
    }
  });
  renderPlayer();
  updateHud();
}
