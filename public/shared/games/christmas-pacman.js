const level = {
  name: 'Recorrido navideño',
  speed: 300,
  map: [
    '#############',
    '#S..........#',
    '#.###.###.#.#',
    '#.#.....#...#',
    '#.#.###.#.###',
    '#...#.#.#...#',
    '###...#.#.#.#',
    '#...#.#...#.#',
    '#.###.###.#.#',
    '#.#...#...#.#',
    '#.#.###.#...#',
    '#.....#....G#',
    '#############'
  ]
};
const dirs = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const difficulties = {
  easy: { label: 'Fácil', tickMs: 400, ghostEvery: 2, chaseChance: 0.5 },
  medium: { label: 'Intermedio', tickMs: 340, ghostEvery: 2, chaseChance: 0.9 },
  hard: { label: 'Muy difícil', tickMs: 300, ghostEvery: 1, chaseChance: 1 }
};
const dirKeys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

function buildGrid(map) {
  return map.map(row => [...row]);
}

function collectPellets(grid) {
  const points = [];
  grid.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
    if (cell === '.') points.push({ row: rowIndex, col: colIndex });
  }));
  return points;
}

function nextStep(grid, from, to) {
  const queue = [{ row: from.row, col: from.col, path: [] }];
  const seen = new Set([`${from.row},${from.col}`]);
  while (queue.length) {
    const current = queue.shift();
    if (current.row === to.row && current.col === to.col) return current.path[0] || null;
    for (const direction of Object.values(dirs)) {
      const row = current.row + direction[0];
      const col = current.col + direction[1];
      const key = `${row},${col}`;
      if (grid[row]?.[col] !== '#' && grid[row]?.[col] && !seen.has(key)) {
        seen.add(key);
        queue.push({ row, col, path: [...current.path, { row, col }] });
      }
    }
  }
  return null;
}

function cellAt(grid, row, col) {
  return grid[row]?.[col];
}

export default function mountChristmasPacman(container) {
  const section = document.createElement('section');
  section.className = 'christmas-pacman-section activity-section';
  section.tabIndex = 0;
  section.innerHTML = '<p class="christmas-pacman-eyebrow">Una carrera invernal</p><h2>Pac-Man navideño</h2><p class="christmas-pacman-intro">Recoge todos los puntos luminosos antes de que te alcance el Grinch. Sin extras: ¡corre!</p><div class="christmas-pacman-menu"><p class="christmas-pacman-menu-title">Elige la dificultad:</p><div class="christmas-pacman-options"><button type="button" data-difficulty="easy">⭐ Fácil</button><button type="button" data-difficulty="medium">⭐⭐ Intermedio</button><button type="button" data-difficulty="hard">⭐⭐⭐ Muy difícil</button></div></div><div class="christmas-pacman-play" hidden><div class="christmas-pacman-hud"><span class="christmas-pacman-level"></span><span class="christmas-pacman-score"></span></div><div class="christmas-pacman-board" role="grid" aria-label="Laberinto de Pac-Man"></div><p class="christmas-pacman-status" aria-live="polite"></p><div class="christmas-pacman-actions"><button class="christmas-pacman-new" type="button" hidden>Intentar de nuevo</button><button class="christmas-pacman-back" type="button">Cambiar dificultad</button></div></div>';
  container.appendChild(section);

  const levelLabel = section.querySelector('.christmas-pacman-level');
  const scoreLabel = section.querySelector('.christmas-pacman-score');
  const board = section.querySelector('.christmas-pacman-board');
  const status = section.querySelector('.christmas-pacman-status');
  const newButton = section.querySelector('.christmas-pacman-new');
  const menu = section.querySelector('.christmas-pacman-menu');
  const playArea = section.querySelector('.christmas-pacman-play');
  const backButton = section.querySelector('.christmas-pacman-back');
  let difficulty = difficulties.medium;
  let tickCount = 0;
  let grid = [];
  let pellets = new Map();
  let player = { row: 1, col: 1 };
  let ghost = { row: 11, col: 11 };
  let direction = null;
  let running = false;
  let score = 0;
  let stepTimer = null;

  function render() {
    board.replaceChildren();
    grid.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
      const node = document.createElement('div');
      node.className = `christmas-pacman-cell${cell === '#' ? ' is-wall' : ''}`;
      node.setAttribute('role', 'gridcell');
      if (pellets.has(`${rowIndex},${colIndex}`)) {
        const dot = document.createElement('span');
        dot.className = 'christmas-pacman-dot';
        node.appendChild(dot);
      }
      if (player.row === rowIndex && player.col === colIndex) {
        node.classList.add('has-player');
        const hero = document.createElement('span');
        hero.className = 'christmas-pacman-hero';
        const rotation = !direction ? 0 : direction[1] === 1 ? 0 : direction[1] === -1 ? 180 : direction[0] === 1 ? 90 : 270;
        hero.style.transform = `rotate(${rotation}deg)`;
        node.appendChild(hero);
      }
      if (ghost.row === rowIndex && ghost.col === colIndex) {
        node.classList.add('has-ghost');
        node.textContent = '😈';
      }
      board.appendChild(node);
    }));
  }

  function eat() {
    const key = `${player.row},${player.col}`;
    if (!pellets.has(key)) return;
    pellets.delete(key);
    score += 1;
    scoreLabel.textContent = `Puntos: ${score}`;
  }

  function movePlayer() {
    if (!direction) return;
    const row = player.row + direction[0];
    const col = player.col + direction[1];
    if (cellAt(grid, row, col) === '#') return;
    player = { row, col };
    eat();
  }

  function moveGhost() {
    if (Math.random() >= difficulty.chaseChance) {
      const options = Object.values(dirs)
        .map(([dr, dc]) => ({ row: ghost.row + dr, col: ghost.col + dc }))
        .filter(next => cellAt(grid, next.row, next.col) && cellAt(grid, next.row, next.col) !== '#');
      if (options.length) ghost = options[Math.floor(Math.random() * options.length)];
      return;
    }
    const step = nextStep(grid, ghost, player);
    if (step) ghost = { row: step.row, col: step.col };
  }

  function finish(won) {
    running = false;
    window.clearInterval(stepTimer);
    section.classList.toggle('is-won', won);
    section.classList.toggle('is-lost', !won);
    newButton.hidden = false;
    status.textContent = won ? '¡Recogiste todos los puntos luminosos! ¡La Navidad está a salvo!' : 'El Grinch te atrapó.';
    if (won) window.launchConfetti?.();
  }

  function tick() {
    movePlayer();
    tickCount += 1;
    if (tickCount % difficulty.ghostEvery === 0) moveGhost();
    render();
    if (player.row === ghost.row && player.col === ghost.col) finish(false);
    else if (!pellets.size) finish(true);
  }

  function startLevel(nextDifficulty) {
    if (nextDifficulty) difficulty = nextDifficulty;
    tickCount = 0;
    grid = buildGrid(level.map);
    pellets = new Map(collectPellets(grid).map(point => [`${point.row},${point.col}`, point]));
    player = { row: 1, col: 1 };
    ghost = { row: grid.length - 2, col: grid[0].length - 2 };
    direction = null;
    score = 0;
    running = true;
    window.clearInterval(stepTimer);
    section.classList.remove('is-won', 'is-lost');
    newButton.hidden = true;
    status.textContent = `Dificultad: ${difficulty.label} · Recoge todos los puntos. El Grinch se acerca.`;
    levelLabel.textContent = `${level.name} · ${pellets.size} puntos`;
    scoreLabel.textContent = 'Puntos: 0';
    board.style.setProperty('--pacman-cols', grid[0].length);
    render();
    stepTimer = window.setInterval(tick, difficulty.tickMs);
    section.focus();
  }

  section.addEventListener('keydown', event => {
    const directionName = dirKeys[event.key];
    if (!directionName) return;
    event.preventDefault();
    direction = dirs[directionName];
  });

  board.addEventListener('click', event => {
    if (!running) return;
    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellWidth = rect.width / grid[0].length;
    const cellHeight = rect.height / grid.length;
    const target = { col: Math.floor(x / cellWidth), row: Math.floor(y / cellHeight) };
    const step = nextStep(grid, player, target);
    if (!step) return;
    direction = [Math.sign(step.row - player.row), Math.sign(step.col - player.col)];
  });

  newButton.addEventListener('click', () => startLevel());
  backButton.addEventListener('click', () => {
    running = false;
    window.clearInterval(stepTimer);
    playArea.hidden = true;
    menu.hidden = false;
  });
  section.querySelectorAll('[data-difficulty]').forEach(button => {
    button.addEventListener('click', () => {
      menu.hidden = true;
      playArea.hidden = false;
      startLevel(difficulties[button.dataset.difficulty]);
    });
  });
}
