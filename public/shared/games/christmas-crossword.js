const wordBank = [
  { word: 'ARBOL', clue: 'Se decora con luces y adornos en diciembre' },
  { word: 'REGALO', clue: 'Se coloca bajo el árbol y se entrega en una ocasión especial' },
  { word: 'RENO', clue: 'Animal que acompaña a Papá Noel en su trineo' },
  { word: 'NIEVE', clue: 'Cubre el paisaje durante el invierno' },
  { word: 'VELA', clue: 'Da luz en la corona de Adviento' },
  { word: 'ESTRELLA', clue: 'Brilla en la punta del árbol' },
  { word: 'CAMPANA', clue: 'Suena y anuncia las fiestas' },
  { word: 'GALLETAS', clue: 'Dulces horneados que se comparten en Navidad' },
  { word: 'ADVIENTO', clue: 'Periodo de las semanas anteriores a Navidad' },
  { word: 'PESEBRE', clue: 'Representa el nacimiento de Jesús' },
  { word: 'TRINEO', clue: 'Vehículo que se desliza sobre la nieve' },
  { word: 'ANGEL', clue: 'Mensajero celestial con alas' },
  { word: 'CANELA', clue: 'Especia aromática usada en postres navideños' },
  { word: 'CORONA', clue: 'Adorno circular que suele llevar cuatro velas' },
  { word: 'INVIERNO', clue: 'Estación más fría del año' },
  { word: 'DUENDE', clue: 'Ayudante de Papá Noel en su taller' },
  { word: 'NOCHEBUENA', clue: 'Noche del 24 de diciembre' },
  { word: 'CARAMELO', clue: 'Dulce pequeño que suele ir en un bastón rayado' },
  { word: 'PAZ', clue: 'Deseo frecuente en los mensajes navideños' },
  { word: 'TURRON', clue: 'Dulce tradicional español de miel y almendras' },
  { word: 'NAVIDAD', clue: 'Celebración del 25 de diciembre' },
  { word: 'LUCES', clue: 'Adornos brillantes que se ponen en el árbol' },
  { word: 'BRINDIS', clue: 'Se hace al levantar las copas en una celebración' },
  { word: 'CENA', clue: 'Comida que muchas familias comparten en Nochebuena' }
];

const targetWords = 11;
const attempts = 120;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function tryLayout(entries) {
  const letters = new Map();
  const directions = new Map();
  const placed = [];
  const key = (row, col) => `${row},${col}`;

  function fits(word, row, col, dir) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    if (letters.has(key(row - dr, col - dc)) || letters.has(key(row + dr * word.length, col + dc * word.length))) return false;
    let crossings = 0;
    for (let index = 0; index < word.length; index += 1) {
      const r = row + dr * index;
      const c = col + dc * index;
      const existing = letters.get(key(r, c));
      if (existing !== undefined) {
        if (existing !== word[index] || directions.get(key(r, c)).has(dir)) return false;
        crossings += 1;
      } else if (letters.has(key(r + dc, c + dr)) || letters.has(key(r - dc, c - dr))) {
        return false;
      }
    }
    return crossings > 0;
  }

  function put(entry, row, col, dir) {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'across' ? 1 : 0;
    for (let index = 0; index < entry.word.length; index += 1) {
      const cellKey = key(row + dr * index, col + dc * index);
      letters.set(cellKey, entry.word[index]);
      if (!directions.has(cellKey)) directions.set(cellKey, new Set());
      directions.get(cellKey).add(dir);
    }
    placed.push({ ...entry, row, col, dir });
  }

  const [first, ...rest] = entries;
  put(first, 0, 0, 'across');

  for (const entry of rest) {
    const candidates = [];
    for (const dir of ['across', 'down']) {
      for (const [cellKey, letter] of letters) {
        const [r, c] = cellKey.split(',').map(Number);
        for (let index = 0; index < entry.word.length; index += 1) {
          if (entry.word[index] !== letter) continue;
          const row = dir === 'down' ? r - index : r;
          const col = dir === 'across' ? c - index : c;
          if (fits(entry.word, row, col, dir)) candidates.push({ row, col, dir });
        }
      }
    }
    if (candidates.length) {
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      put(entry, choice.row, choice.col, choice.dir);
    }
  }
  return placed;
}

function generate() {
  let best = null;
  let bestScore = -Infinity;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const chosen = shuffle(wordBank).slice(0, targetWords + 3);
    chosen.sort((a, b) => b.word.length - a.word.length + (Math.random() - 0.5) * 3);
    const placed = tryLayout(chosen);
    const rows = placed.flatMap(item => (item.dir === 'down' ? [item.row, item.row + item.word.length - 1] : [item.row]));
    const cols = placed.flatMap(item => (item.dir === 'across' ? [item.col, item.col + item.word.length - 1] : [item.col]));
    const area = (Math.max(...rows) - Math.min(...rows) + 1) * (Math.max(...cols) - Math.min(...cols) + 1);
    const score = Math.min(placed.length, targetWords) * 1000 - area;
    if (score > bestScore) {
      bestScore = score;
      best = placed;
    }
  }
  const minRow = Math.min(...best.map(item => item.row));
  const minCol = Math.min(...best.map(item => item.col));
  const words = best.map(item => ({ ...item, row: item.row - minRow, col: item.col - minCol }));
  const rowCount = Math.max(...words.map(item => (item.dir === 'down' ? item.row + item.word.length : item.row + 1)));
  const colCount = Math.max(...words.map(item => (item.dir === 'across' ? item.col + item.word.length : item.col + 1)));

  const starts = new Map();
  words.forEach(item => starts.set(`${item.row},${item.col}`, true));
  let number = 0;
  const numbers = new Map();
  for (let r = 0; r < rowCount; r += 1) {
    for (let c = 0; c < colCount; c += 1) {
      if (starts.has(`${r},${c}`)) {
        number += 1;
        numbers.set(`${r},${c}`, number);
      }
    }
  }
  words.forEach(item => { item.number = numbers.get(`${item.row},${item.col}`); });
  return { words, rowCount, colCount, numbers };
}

function wordCells(item) {
  return Array.from({ length: item.word.length }, (_, index) => ({
    row: item.row + (item.dir === 'down' ? index : 0),
    col: item.col + (item.dir === 'across' ? index : 0)
  }));
}

export default function mountChristmasCrossword(container) {
  const section = document.createElement('section');
  section.className = 'crossword-section activity-section';
  section.innerHTML = '<p class="crossword-eyebrow">Reto de ingenio</p><h2>Crucigrama navideño</h2>'
    + '<div class="crossword-game"><p class="crossword-intro">Toca una casilla y escribe la respuesta. Vuelve a tocar la misma casilla para cambiar la dirección.</p><p class="crossword-active" aria-live="polite"></p><div class="crossword-grid"></div><div class="crossword-actions"><button class="crossword-check" type="button">Comprobar</button><button class="crossword-hint" type="button">Revelar letra</button><button class="crossword-new" type="button">Nuevo crucigrama</button></div><p class="crossword-feedback" aria-live="polite"></p><div class="crossword-clues"><div><h3>Horizontal</h3><ol class="crossword-across"></ol></div><div><h3>Vertical</h3><ol class="crossword-down"></ol></div></div></div>'
    + '<div class="crossword-result" aria-live="polite" hidden><p class="crossword-result-title">¡Crucigrama resuelto!</p><p class="crossword-result-score"></p><p class="crossword-result-note"></p><button class="crossword-again" type="button">Nuevo crucigrama</button></div>';
  container.appendChild(section);

  const game = section.querySelector('.crossword-game');
  const gridEl = section.querySelector('.crossword-grid');
  const activeEl = section.querySelector('.crossword-active');
  const feedback = section.querySelector('.crossword-feedback');
  const acrossList = section.querySelector('.crossword-across');
  const downList = section.querySelector('.crossword-down');
  const result = section.querySelector('.crossword-result');
  const resultScore = section.querySelector('.crossword-result-score');
  const resultNote = section.querySelector('.crossword-result-note');

  let puzzle = null;
  let inputs = new Map();
  let wordAt = new Map();
  let active = null;
  let activeDir = 'across';
  let hints = 0;
  let wrongChecks = 0;
  let startedAt = 0;

  const key = (row, col) => `${row},${col}`;

  function activeWord() {
    return active ? puzzle.words.find(item => item.dir === activeDir && wordCells(item).some(cell => cell.row === active.row && cell.col === active.col)) : null;
  }

  function wordsAt(row, col) {
    return puzzle.words.filter(item => wordCells(item).some(cell => cell.row === row && cell.col === col));
  }

  function refresh() {
    inputs.forEach(input => input.classList.remove('is-active', 'is-word'));
    const word = activeWord();
    if (word) {
      wordCells(word).forEach(cell => inputs.get(key(cell.row, cell.col)).classList.add('is-word'));
      activeEl.textContent = `${word.number} ${word.dir === 'across' ? 'horizontal' : 'vertical'}: ${word.clue} (${word.word.length} letras)`;
    } else {
      activeEl.textContent = 'Elige una casilla.';
    }
    if (active) inputs.get(key(active.row, active.col)).classList.add('is-active');
    puzzle.words.forEach(item => {
      const done = wordCells(item).every(cell => inputs.get(key(cell.row, cell.col)).value === item.word[wordCells(item).findIndex(c => c.row === cell.row && c.col === cell.col)]);
      item.clueEl.classList.toggle('is-done', done);
      item.clueEl.classList.toggle('is-current', item === word);
    });
  }

  function select(row, col, toggle = false) {
    const options = wordsAt(row, col);
    if (!options.length) return;
    const same = active && active.row === row && active.col === col;
    if (same && toggle && options.length > 1) activeDir = activeDir === 'across' ? 'down' : 'across';
    else if (!options.some(item => item.dir === activeDir)) activeDir = options[0].dir;
    active = { row, col };
    inputs.get(key(row, col)).focus();
    refresh();
  }

  function step(delta) {
    const word = activeWord();
    if (!word) return;
    const cells = wordCells(word);
    const index = cells.findIndex(cell => cell.row === active.row && cell.col === active.col);
    const next = cells[index + delta];
    if (next) select(next.row, next.col);
  }

  function clearMarks() {
    inputs.forEach(input => input.classList.remove('is-wrong'));
  }

  function isSolved() {
    return puzzle.words.every(item => wordCells(item).every((cell, index) => inputs.get(key(cell.row, cell.col)).value === item.word[index]));
  }

  function solutionAt(row, col) {
    const item = wordsAt(row, col)[0];
    const index = wordCells(item).findIndex(cell => cell.row === row && cell.col === col);
    return item.word[index];
  }

  function finish() {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    const points = Math.max(0, puzzle.words.length * 100 - hints * 30 - wrongChecks * 10);
    game.hidden = true;
    resultScore.textContent = points;
    resultNote.textContent = `Puntos · Tiempo ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} · ${hints} ${hints === 1 ? 'pista' : 'pistas'}`;
    result.hidden = false;
    if (points >= puzzle.words.length * 70) window.launchConfetti?.();
    section.querySelector('.crossword-again').focus();
  }

  function build() {
    puzzle = generate();
    hints = 0;
    wrongChecks = 0;
    active = null;
    activeDir = 'across';
    inputs = new Map();
    startedAt = Date.now();
    feedback.textContent = '';
    gridEl.replaceChildren();
    gridEl.style.gridTemplateColumns = `repeat(${puzzle.colCount},1fr)`;
    gridEl.style.setProperty('--cols', puzzle.colCount);

    for (let row = 0; row < puzzle.rowCount; row += 1) {
      for (let col = 0; col < puzzle.colCount; col += 1) {
        const wrapper = document.createElement('div');
        const cellKey = key(row, col);
        const isLetter = puzzle.words.some(item => wordCells(item).some(cell => cell.row === row && cell.col === col));
        wrapper.className = `crossword-cell${isLetter ? '' : ' is-block'}`;
        if (isLetter) {
          if (puzzle.numbers.has(cellKey)) {
            const label = document.createElement('span');
            label.className = 'crossword-number';
            label.textContent = puzzle.numbers.get(cellKey);
            wrapper.appendChild(label);
          }
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.autocomplete = 'off';
          input.autocapitalize = 'characters';
          input.spellcheck = false;
          input.setAttribute('aria-label', `Casilla, fila ${row + 1}, columna ${col + 1}`);
          input.addEventListener('focus', () => {
            input.select();
            if (!active || active.row !== row || active.col !== col) select(row, col);
          });
          input.addEventListener('mousedown', () => {
            if (document.activeElement === input) select(row, col, true);
          });
          input.addEventListener('input', () => {
            const value = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
            input.value = value.slice(-1);
            input.classList.remove('is-wrong');
            if (input.value) step(1);
            refresh();
            if (isSolved()) finish();
          });
          input.addEventListener('keydown', event => {
            const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
            if (event.key === 'Backspace' && !input.value) {
              event.preventDefault();
              step(-1);
              const previous = active && inputs.get(key(active.row, active.col));
              if (previous && !previous.readOnly) previous.value = '';
              refresh();
            } else if (moves[event.key]) {
              event.preventDefault();
              const [dr, dc] = moves[event.key];
              let r = row + dr;
              let c = col + dc;
              while (r >= 0 && c >= 0 && r < puzzle.rowCount && c < puzzle.colCount && !inputs.has(key(r, c))) {
                r += dr;
                c += dc;
              }
              if (inputs.has(key(r, c))) {
                activeDir = dr ? 'down' : 'across';
                select(r, c);
              }
            }
          });
          wrapper.appendChild(input);
          inputs.set(cellKey, input);
        }
        gridEl.appendChild(wrapper);
      }
    }

    acrossList.replaceChildren();
    downList.replaceChildren();
    [...puzzle.words].sort((a, b) => a.number - b.number).forEach(item => {
      const li = document.createElement('li');
      li.value = item.number;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${item.clue} (${item.word.length})`;
      button.addEventListener('click', () => {
        activeDir = item.dir;
        const cells = wordCells(item);
        const target = cells.find(cell => !inputs.get(key(cell.row, cell.col)).value) || cells[0];
        select(target.row, target.col);
      });
      li.appendChild(button);
      item.clueEl = li;
      (item.dir === 'across' ? acrossList : downList).appendChild(li);
    });
    refresh();
  }

  function startGame() {
    game.hidden = false;
    result.hidden = true;
    build();
  }

  section.querySelector('.crossword-check').addEventListener('click', () => {
    clearMarks();
    let wrong = 0;
    let empty = 0;
    inputs.forEach((input, cellKey) => {
      if (!input.value) {
        empty += 1;
        return;
      }
      const [row, col] = cellKey.split(',').map(Number);
      if (input.value !== solutionAt(row, col)) {
        input.classList.add('is-wrong');
        wrong += 1;
      }
    });
    if (wrong) wrongChecks += 1;
    feedback.textContent = wrong ? `${wrong} ${wrong === 1 ? 'letra es incorrecta' : 'letras son incorrectas'}.` : empty ? '¡Hasta ahora todo está bien!' : '';
  });

  section.querySelector('.crossword-hint').addEventListener('click', () => {
    if (!active) {
      feedback.textContent = 'Elige primero una casilla.';
      return;
    }
    const input = inputs.get(key(active.row, active.col));
    if (input.value === solutionAt(active.row, active.col)) return;
    hints += 1;
    input.value = solutionAt(active.row, active.col);
    input.classList.remove('is-wrong');
    input.classList.add('is-hint');
    refresh();
    feedback.textContent = 'Pista utilizada (−30 puntos).';
    if (isSolved()) finish();
  });

  section.querySelector('.crossword-new').addEventListener('click', () => {
    if (window.confirm('¿Empezar un crucigrama nuevo? Perderás tu progreso actual.')) startGame();
  });
  section.querySelector('.crossword-again').addEventListener('click', startGame);
  startGame();
}
