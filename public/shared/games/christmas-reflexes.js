const icons = ['🎁', '🍬', '🎄', '⭐', '🔔', '🕯️', '🦌', '🧦', '🍪', '❄️'];
const gameDuration = 30000;
const objectSizes = [54, 42, 34];

function randomNumber(min, max) {
  return min + Math.random() * (max - min);
}

function iconLife(elapsed, iconIndex) {
  const difficulty = elapsed / gameDuration;
  const baseLife = randomNumber(1100 - difficulty * 420, 1300 - difficulty * 500);
  return Math.max(360, baseLife - iconIndex * randomNumber(35, 95));
}

export default function mountChristmasReflexes(container) {
  const section = document.createElement('section');
  section.className = 'christmas-reflexes-section activity-section';
  section.innerHTML = '<p class="christmas-reflexes-eyebrow">Reflejos bajo la nieve</p><h2>Reflejos navideños</h2><p class="christmas-reflexes-intro">Empieza la ronda y toca cada símbolo invernal antes de que desaparezca.</p><div class="christmas-reflexes-hud"><span class="christmas-reflexes-time"></span><span class="christmas-reflexes-score"></span></div><div class="christmas-reflexes-arena" role="application" aria-label="Toca los símbolos navideños"><div class="christmas-reflexes-sky" aria-hidden="true"></div><button class="christmas-reflexes-start" type="button">Empezar ronda</button><p class="christmas-reflexes-status" aria-live="polite">¿Listo? Tienes 30 segundos: ¡mira bien y ten los dedos preparados!</p></div><button class="christmas-reflexes-new" type="button" hidden>Nueva ronda</button>';
  container.appendChild(section);

  const timeNode = section.querySelector('.christmas-reflexes-time');
  const scoreNode = section.querySelector('.christmas-reflexes-score');
  const arena = section.querySelector('.christmas-reflexes-arena');
  const startButton = section.querySelector('.christmas-reflexes-start');
  const status = section.querySelector('.christmas-reflexes-status');
  const newButton = section.querySelector('.christmas-reflexes-new');
  let score = 0;
  let startedAt = 0;
  let running = false;
  let spawnTimer = null;
  let tickTimer = null;
  let targetTimers = [];

  function updateHud(remaining = gameDuration) {
    timeNode.textContent = `${Math.ceil(remaining / 1000)} s`;
    scoreNode.textContent = `Puntos: ${score}`;
  }

  function clearTarget(target) {
    const entry = targetTimers.find(item => item.target === target);
    if (entry) window.clearTimeout(entry.timeout);
    targetTimers = targetTimers.filter(item => item.target !== target);
    target.remove();
  }

  function scheduleTargetLife(target, life) {
    const timeout = window.setTimeout(() => {
      if (!running) return;
      clearTarget(target);
    }, life);
    targetTimers.push({ target, timeout });
  }

  function spawnTarget() {
    if (!running) return;
    const elapsed = Date.now() - startedAt;
    const index = Math.floor(Math.random() * icons.length);
    const icon = icons[index];
    const size = objectSizes[index % objectSizes.length];
    const target = document.createElement('button');
    target.type = 'button';
    target.className = `christmas-reflexes-target christmas-reflexes-target-${index % 3}`;
    target.style.left = `${randomNumber(2, 94)}%`;
    target.style.top = `${randomNumber(8, 82)}%`;
    target.style.fontSize = `${size * randomNumber(.72, 1)}px`;
    target.textContent = icon;
    target.setAttribute('aria-label', `Tocar ${icon}`);
    target.addEventListener('click', () => {
      if (!running) return;
      score += 1;
      status.textContent = `¡Atrápalo! ${icon}`;
      updateHud();
      clearTarget(target);
    });
    arena.appendChild(target);
    scheduleTargetLife(target, iconLife(elapsed, index));
  }

  function endGame() {
    running = false;
    window.clearTimeout(spawnTimer);
    window.clearInterval(tickTimer);
    targetTimers.forEach(({ timeout }) => window.clearTimeout(timeout));
    targetTimers = [];
    arena.querySelectorAll('.christmas-reflexes-target').forEach(target => target.remove());
    section.classList.add('is-complete');
    startButton.hidden = true;
    newButton.hidden = false;
    status.textContent = score === 0 ? 'Terminó la ronda. ¡Inténtalo de nuevo!' : `¡Listo! Atrapaste ${score} símbolos.`;
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
  }

  function startGame() {
    score = 0;
    startedAt = Date.now();
    running = true;
    section.classList.remove('is-complete');
    startButton.hidden = true;
    newButton.hidden = true;
    status.textContent = 'Toca los símbolos en cuanto aparezcan.';
    updateHud();
    tickTimer = window.setInterval(tick, 100);

    const spawn = () => {
      if (!running) return;
      const elapsed = Date.now() - startedAt;
      spawnTarget();
      const difficulty = elapsed / gameDuration;
      const interval = Math.max(230, randomNumber(430 - difficulty * 170, 700 - difficulty * 260));
      spawnTimer = window.setTimeout(spawn, interval);
    };
    spawn();
  }

  startButton.addEventListener('click', startGame);
  newButton.addEventListener('click', startGame);
  updateHud();
}
