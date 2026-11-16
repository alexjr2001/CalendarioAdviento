const wordPool = [
  'NAVIDAD', 'ARBOL', 'NIEVE', 'REGALOS', 'RENO', 'VELAS', 'CAMPANAS', 'CANELA',
  'ESTRELLA', 'PESEBRE', 'ADVIENTO', 'CORONA', 'DUENDE', 'TRINEO', 'GALLETAS',
  'ANGEL', 'NOCHEBUENA', 'CARAMELO', 'GUIRNALDA', 'INVIERNO', 'LUZ', 'PAZ'
];
const GRID_SIZE = 12;
const WORD_COUNT = 9;
const directions = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
const diagonalDirections = directions.filter(([rowStep, colStep]) => rowStep && colStep);
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - .5);
}

function tryBuildPuzzle(words) {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const placed = [];
  // The shortest word always fits diagonally, which guarantees at least one diagonal.
  const diagonalWord = [...words].sort((a, b) => a.length - b.length)[0];

  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    let wasPlaced = false;
    const allowed = word === diagonalWord ? diagonalDirections : directions;
    for (let attempt = 0; attempt < 250 && !wasPlaced; attempt += 1) {
      const [rowStep, colStep] = allowed[randomInt(allowed.length)];
      const startRow = randomInt(GRID_SIZE);
      const startCol = randomInt(GRID_SIZE);
      const endRow = startRow + rowStep * (word.length - 1);
      const endCol = startCol + colStep * (word.length - 1);
      if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;

      const cells = Array.from({ length: word.length }, (_, index) => [startRow + rowStep * index, startCol + colStep * index]);
      if (cells.some(([row, col], index) => grid[row][col] && grid[row][col] !== word[index])) continue;

      cells.forEach(([row, col], index) => { grid[row][col] = word[index]; });
      placed.push({ word, cells });
      wasPlaced = true;
    }
    if (!wasPlaced) return null;
  }

  // Filler mostly reuses the hidden words' letters so guessing by rare letters doesn't work.
  const wordLetters = [...new Set(words.join(''))];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (grid[row][col]) continue;
      const source = Math.random() < .7 ? wordLetters : alphabet;
      grid[row][col] = source[randomInt(source.length)];
    }
  }
  return { grid, placed };
}

function buildPuzzle() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const puzzle = tryBuildPuzzle(shuffled(wordPool).slice(0, WORD_COUNT));
    if (puzzle) return puzzle;
  }
  return tryBuildPuzzle(shuffled(wordPool).slice(0, 6));
}

function straightLine(from, to) {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  if (rowDiff && colDiff && Math.abs(rowDiff) !== Math.abs(colDiff)) return null;
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  const rowStep = Math.sign(rowDiff);
  const colStep = Math.sign(colDiff);
  return Array.from({ length: steps + 1 }, (_, index) => [from.row + rowStep * index, from.col + colStep * index]);
}

export default function mountWordsearch(container) {
  const section = document.createElement('section');
  section.className = 'wordsearch-section activity-section';
  section.innerHTML = '<h2>Sopa de letras navideña</h2><p class="wordsearch-hint">Las palabras pueden estar en horizontal, vertical, diagonal o al revés. Arrastra sobre las letras o toca la primera y la última.</p><div class="wordsearch-board" role="group" aria-label="Cuadrícula de letras"></div><ul class="wordsearch-words" aria-label="Palabras por encontrar"></ul><div class="wordsearch-footer"><p class="wordsearch-status" aria-live="polite"></p><button class="wordsearch-reset" type="button">Empezar de nuevo</button></div>';
  container.appendChild(section);

  const board = section.querySelector('.wordsearch-board');
  const wordList = section.querySelector('.wordsearch-words');
  const statusNode = section.querySelector('.wordsearch-status');
  let puzzle;
  let cellNodes;
  let wordNodes;
  let found;
  let dragStart = null;
  let anchor = null;
  let path = [];

  function renderStatus(message = '') {
    statusNode.textContent = message || `Encontradas: ${found.size}/${puzzle.placed.length}`;
  }

  function paintSelection() {
    cellNodes.flat().forEach(node => node.classList.remove('is-selected'));
    const selected = path.length ? path : anchor ? [[anchor.row, anchor.col]] : [];
    selected.forEach(([row, col]) => cellNodes[row][col].classList.add('is-selected'));
  }

  function cellFromEvent(event) {
    const node = document.elementFromPoint(event.clientX, event.clientY)?.closest('.wordsearch-cell');
    return node && board.contains(node) ? { row: Number(node.dataset.row), col: Number(node.dataset.col) } : null;
  }

  function checkSelection() {
    const text = path.map(([row, col]) => puzzle.grid[row][col]).join('');
    const reversed = [...text].reverse().join('');
    const match = puzzle.placed.find(item => !found.has(item.word) && (item.word === text || item.word === reversed));
    path.forEach(([row, col]) => cellNodes[row][col].classList.remove('is-selected'));
    if (!match) {
      renderStatus(path.length > 1 ? 'Esa palabra no está en la lista.' : '');
      path = [];
      paintSelection();
      return;
    }
    found.add(match.word);
    path.forEach(([row, col]) => cellNodes[row][col].classList.add('is-found'));
    wordNodes.get(match.word).classList.add('is-found');
    renderStatus(found.size === puzzle.placed.length ? '¡Feliz Navidad! Encontraste todas las palabras.' : `Encontrada: ${match.word}`);
    path = [];
    paintSelection();
  }

  board.addEventListener('pointerdown', event => {
    const cell = cellFromEvent(event);
    if (!cell) return;
    event.preventDefault();
    try { board.setPointerCapture(event.pointerId); } catch { /* Synthetic events may not be capturable. */ }

    if (anchor && (anchor.row !== cell.row || anchor.col !== cell.col)) {
      const line = straightLine(anchor, cell);
      if (line) {
        path = line;
        anchor = null;
        checkSelection();
        return;
      }
    }
    dragStart = cell;
    anchor = null;
    path = [[cell.row, cell.col]];
    paintSelection();
  });

  board.addEventListener('pointermove', event => {
    if (!dragStart) return;
    const cell = cellFromEvent(event);
    const line = cell && straightLine(dragStart, cell);
    if (!line) return;
    path = line;
    paintSelection();
  });

  board.addEventListener('pointerup', () => {
    if (!dragStart) return;
    if (path.length < 2) {
      anchor = dragStart;
      dragStart = null;
      path = [];
      paintSelection();
      return;
    }
    dragStart = null;
    checkSelection();
  });

  board.addEventListener('pointercancel', () => {
    dragStart = null;
    anchor = null;
    path = [];
    paintSelection();
  });

  function resetGame() {
    puzzle = buildPuzzle();
    found = new Set();
    dragStart = null;
    anchor = null;
    path = [];
    board.style.setProperty('--wordsearch-size', GRID_SIZE);
    board.replaceChildren();
    cellNodes = puzzle.grid.map((letters, row) => letters.map((letter, col) => {
      const node = document.createElement('span');
      node.className = 'wordsearch-cell';
      node.dataset.row = row;
      node.dataset.col = col;
      node.textContent = letter;
      board.appendChild(node);
      return node;
    }));

    wordList.replaceChildren();
    wordNodes = new Map();
    [...puzzle.placed].sort((a, b) => a.word.localeCompare(b.word)).forEach(({ word }) => {
      const item = document.createElement('li');
      item.textContent = word;
      wordList.appendChild(item);
      wordNodes.set(word, item);
    });
    renderStatus();
  }

  section.querySelector('.wordsearch-reset').addEventListener('click', resetGame);
  resetGame();
}
