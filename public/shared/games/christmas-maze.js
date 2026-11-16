const mazes = [
  [
    '#############',
    '#S..#.....#.#',
    '###.###.#.#.#',
    '#...#...#...#',
    '#.###.#####.#',
    '#...#...#.#.#',
    '###.#.#.#.#.#',
    '#...#.#.#...#',
    '#.#####.#.###',
    '#...#...#.#.#',
    '###.#.###.#.#',
    '#.....#....G#',
    '#############'
  ],
  [
    '#############',
    '#S..#.......#',
    '###.#.#####.#',
    '#...#...#...#',
    '#.###.#####.#',
    '#...#...#.#.#',
    '###.#.#.#.#.#',
    '#.#.#.#.#...#',
    '#.#.###.#.###',
    '#...#...#.#.#',
    '#.###.###.#.#',
    '#.....#....G#',
    '#############'
  ],
  [
    '#############',
    '#S..#.....#.#',
    '###.###.#.#.#',
    '#.#.#...#...#',
    '#.#.#.#####.#',
    '#.#.#...#.#.#',
    '#.#.#.#.#.#.#',
    '#...#.#.#...#',
    '#.#####.#.###',
    '#...#...#.#.#',
    '###.#.###.#.#',
    '#.....#....G#',
    '#############'
  ],
  [
    '#############',
    '#S..#.....#.#',
    '###.###.#.#.#',
    '#.#.....#...#',
    '#.#########.#',
    '#.........#.#',
    '#.###.#.###.#',
    '#.#.#.#.#...#',
    '#.#.#.###.###',
    '#...#.....#.#',
    '###.#######.#',
    '#..........G#',
    '#############'
  ],
  [
    '#############',
    '#S#.........#',
    '#.###.#####.#',
    '#...#...#...#',
    '###.#.#.###.#',
    '#.#.#.#...#.#',
    '#.#.###.#.#.#',
    '#.#...#.#.#.#',
    '#.###.###.#.#',
    '#.....#...#.#',
    '#.#####.###.#',
    '#.......#..G#',
    '#############'
  ]
];

const characters = [
  { id: 'santa', icon: '🎅', label: 'Papá Noel' },
  { id: 'candy', icon: '🍭', label: 'Bastón de caramelo' },
  { id: 'gift', icon: '🎁', label: 'Regalo' },
  { id: 'reindeer', icon: '🦌', label: 'Reno' }
];
const moves = {
  ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
  ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
  ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
  ArrowRight: [0, 1], d: [0, 1], D: [0, 1]
};

export default function mountChristmasMaze(container) {
  const section = document.createElement('section');
  section.className = 'christmas-maze-section activity-section';
  section.tabIndex = 0;
  section.innerHTML = '<p class="christmas-maze-eyebrow">Un desvío entre la nieve</p><h2>El camino al árbol de Navidad</h2><p class="christmas-maze-intro">Elige a tu compañero y encuentra el camino por el bosque invernal.</p><div class="christmas-maze-characters" role="group" aria-label="Elegir personaje"></div><button class="christmas-maze-start" type="button">Empezar laberinto</button><div class="christmas-maze-play" hidden><div class="christmas-maze-heading"><span class="christmas-maze-level"></span><span class="christmas-maze-steps"></span></div><div class="christmas-maze-board" role="grid" aria-label="Laberinto"></div><div class="christmas-maze-controls" aria-label="Controles de movimiento"><span></span><button type="button" data-move="ArrowUp" aria-label="Arriba">↑</button><span></span><button type="button" data-move="ArrowLeft" aria-label="Izquierda">←</button><button type="button" data-move="ArrowDown" aria-label="Abajo">↓</button><button type="button" data-move="ArrowRight" aria-label="Derecha">→</button></div><p class="christmas-maze-status" aria-live="polite"></p></div><button class="christmas-maze-new" type="button" hidden>Nuevo laberinto</button>';
  container.appendChild(section);

  const characterPicker = section.querySelector('.christmas-maze-characters');
  const levelLabel = section.querySelector('.christmas-maze-level');
  const stepLabel = section.querySelector('.christmas-maze-steps');
  const board = section.querySelector('.christmas-maze-board');
  const playArea = section.querySelector('.christmas-maze-play');
  const startButton = section.querySelector('.christmas-maze-start');
  const newButton = section.querySelector('.christmas-maze-new');
  const status = section.querySelector('.christmas-maze-status');
  const controls = section.querySelector('.christmas-maze-controls');
  let character = characters[0];
  let previousMaze = -1;
  let mazeIndex = 0;
  let grid = [];
  let position = { row: 1, col: 1 };
  let steps = 0;
  let complete = false;

  function renderCharacters() {
    characterPicker.replaceChildren(...characters.map(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `christmas-maze-character${option.id === character.id ? ' is-selected' : ''}`;
      button.setAttribute('aria-pressed', option.id === character.id);
      button.setAttribute('aria-label', option.label);
      button.innerHTML = `<span aria-hidden="true">${option.icon}</span><small>${option.label}</small>`;
      button.addEventListener('click', () => {
        character = option;
        complete = false;
        steps = 0;
        position = { row: 1, col: 1 };
        status.textContent = '';
        section.classList.remove('is-complete');
        renderCharacters();
        renderMaze();
      });
      return button;
    }));
  }

  function renderMaze() {
    const cells = [];
    board.replaceChildren();
    grid.forEach((row, rowIndex) => row.forEach((tile, colIndex) => {
      const cell = document.createElement('div');
      cell.className = `christmas-maze-cell${tile === '#' ? ' is-wall' : ''}${tile === 'G' ? ' is-goal' : ''}${tile === 'S' ? ' is-start' : ''}`;
      cell.setAttribute('role', 'gridcell');
      if (position.row === rowIndex && position.col === colIndex) {
        cell.classList.add('has-player');
        cell.textContent = character.icon;
        cell.setAttribute('aria-label', character.label);
      } else if (tile === 'G') {
        cell.textContent = '🎄';
        cell.setAttribute('aria-label', 'Árbol de Navidad: meta');
      } else if (tile === '#') {
        cell.setAttribute('aria-label', 'Pared');
      }
      cells.push(cell);
    }));
    board.style.setProperty('--maze-size', grid[0].length);
    board.replaceChildren(...cells);
    levelLabel.textContent = `Bosque invernal ${mazeIndex + 1} / ${mazes.length}`;
    stepLabel.textContent = `${steps} pasos`;
  }

  function startMaze() {
    startButton.hidden = true;
    playArea.hidden = false;
    newButton.hidden = false;
    board.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const options = mazes.map((_, index) => index).filter(index => index !== previousMaze);
    mazeIndex = options[Math.floor(Math.random() * options.length)];
    previousMaze = mazeIndex;
    grid = mazes[mazeIndex].map(row => [...row]);
    position = { row: 1, col: 1 };
    steps = 0;
    complete = false;
    status.textContent = 'Encuentra el árbol de Navidad al otro lado del bosque.';
    section.classList.remove('is-complete');
    renderMaze();
  }

  function move(key) {
    if (complete) return;
    const direction = moves[key];
    if (!direction) return;
    const row = position.row + direction[0];
    const col = position.col + direction[1];
    if (grid[row]?.[col] === '#' || !grid[row]?.[col]) return;
    position = { row, col };
    steps += 1;
    if (grid[row][col] === 'G') {
      complete = true;
      status.textContent = `¡Lo lograste! Llegaste al árbol de Navidad en ${steps} pasos.`;
      section.classList.add('is-complete');
      window.launchConfetti?.();
    }
    renderMaze();
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-move]');
    if (button) move(button.dataset.move);
  });

  section.addEventListener('keydown', event => {
    if (!moves[event.key]) return;
    event.preventDefault();
    move(event.key);
  });

  let swipeStart = null;
  board.addEventListener('pointerdown', event => {
    swipeStart = { x: event.clientX, y: event.clientY };
    board.setPointerCapture?.(event.pointerId);
  });
  board.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 14) return;
    move(Math.abs(deltaX) > Math.abs(deltaY) ? deltaX > 0 ? 'ArrowRight' : 'ArrowLeft' : deltaY > 0 ? 'ArrowDown' : 'ArrowUp');
  });
  board.addEventListener('pointercancel', () => { swipeStart = null; });

  newButton.addEventListener('click', startMaze);
  startButton.addEventListener('click', startMaze);
  renderCharacters();
}
