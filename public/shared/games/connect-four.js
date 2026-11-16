const cols = 7;
const rows = 6;
const symbols = ['🎅', '🎄'];
const aiDepth = 5;

function createBoard() {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function dropRow(board, col) {
  for (let row = rows - 1; row >= 0; row -= 1) if (board[row][col] === null) return row;
  return -1;
}

function validCols(board) {
  return Array.from({ length: cols }, (_, col) => col).filter(col => board[0][col] === null);
}

const lineDirections = [[0, 1], [1, 0], [1, 1], [1, -1]];

function findWin(board) {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const player = board[row][col];
      if (player === null) continue;
      for (const [dr, dc] of lineDirections) {
        const cells = [];
        for (let step = 0; step < 4; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
          cells.push(r * cols + c);
        }
        if (cells.length === 4) return { player, cells };
      }
    }
  }
  return null;
}

function scoreWindow(values, player) {
  const mine = values.filter(value => value === player).length;
  const theirs = values.filter(value => value === 1 - player).length;
  const empty = 4 - mine - theirs;
  if (mine && theirs) return 0;
  if (mine === 3 && empty === 1) return 5;
  if (mine === 2 && empty === 2) return 2;
  if (theirs === 3 && empty === 1) return -4;
  return 0;
}

function evaluate(board, player) {
  let score = 0;
  const center = Math.floor(cols / 2);
  for (let row = 0; row < rows; row += 1) if (board[row][center] === player) score += 3;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      for (const [dr, dc] of lineDirections) {
        const values = [];
        for (let step = 0; step < 4; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r < 0 || r >= rows || c < 0 || c >= cols) break;
          values.push(board[r][c]);
        }
        if (values.length === 4) score += scoreWindow(values, player);
      }
    }
  }
  return score;
}

// Negamax with alpha-beta pruning; score is from the perspective of `player`.
function negamax(board, player, depth, alpha, beta) {
  const win = findWin(board);
  if (win) return win.player === player ? 100000 + depth : -100000 - depth;
  const moves = validCols(board);
  if (!moves.length) return 0;
  if (depth === 0) return evaluate(board, player) - evaluate(board, 1 - player);
  const order = [...moves].sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
  let best = -Infinity;
  for (const col of order) {
    const row = dropRow(board, col);
    board[row][col] = player;
    const score = -negamax(board, 1 - player, depth - 1, -beta, -alpha);
    board[row][col] = null;
    best = Math.max(best, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return best;
}

function bestColumn(board, player) {
  let best = -Infinity;
  let choices = [];
  for (const col of validCols(board)) {
    const row = dropRow(board, col);
    board[row][col] = player;
    const score = -negamax(board, 1 - player, aiDepth - 1, -Infinity, Infinity);
    board[row][col] = null;
    if (score > best) {
      best = score;
      choices = [col];
    } else if (score === best) {
      choices.push(col);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function mountConnectFour(container) {
  const section = document.createElement('section');
  section.className = 'connect4-section activity-section';
  section.innerHTML = '<p class="connect4-eyebrow">Juego navideño</p><h2>Conecta cuatro</h2>'
    + '<div class="connect4-menu"><p class="connect4-notice">Juega contra la computadora o con otra persona en la misma pantalla.</p><div class="connect4-options"><button type="button" data-mode="computer">🎄 Contra la computadora</button><button type="button" data-mode="friend">🎅 Contra otra persona</button></div></div>'
    + '<div class="connect4-game" hidden><p class="connect4-score" aria-live="polite"></p><div class="connect4-drops"></div><div class="connect4-board" role="grid"></div><p class="connect4-status" aria-live="polite"></p><div class="connect4-actions"><button class="connect4-again" type="button">Jugar otra vez</button><button class="connect4-back" type="button">Menú</button></div></div>';
  container.appendChild(section);

  const menu = section.querySelector('.connect4-menu');
  const game = section.querySelector('.connect4-game');
  const dropsEl = section.querySelector('.connect4-drops');
  const boardEl = section.querySelector('.connect4-board');
  const status = section.querySelector('.connect4-status');
  const scoreEl = section.querySelector('.connect4-score');
  const againButton = section.querySelector('.connect4-again');
  const backButton = section.querySelector('.connect4-back');

  const dropButtons = Array.from({ length: cols }, (_, col) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'connect4-drop';
    button.textContent = '▼';
    button.setAttribute('aria-label', `Columna ${col + 1}`);
    button.addEventListener('click', () => humanMove(col));
    dropsEl.appendChild(button);
    return button;
  });

  const cellEls = Array.from({ length: rows * cols }, (_, index) => {
    const cell = document.createElement('div');
    cell.className = 'connect4-cell';
    cell.addEventListener('click', () => humanMove(index % cols));
    boardEl.appendChild(cell);
    return cell;
  });

  let vsComputer = true;
  let names = ['Tú', 'Computadora'];
  let board = createBoard();
  let current = 0;
  let over = false;
  let wins = [0, 0];
  let draws = 0;
  let starter = 0;
  let lastIndex = -1;
  let computerTimer = 0;

  function renderScore() {
    scoreEl.textContent = `${symbols[0]} ${names[0]} ${wins[0]} · Empates ${draws} · ${wins[1]} ${names[1]} ${symbols[1]}`;
  }

  function render(winCells = []) {
    cellEls.forEach((cell, index) => {
      const value = board[Math.floor(index / cols)][index % cols];
      cell.dataset.player = value === null ? '' : value;
      cell.textContent = value === null ? '' : symbols[value];
      cell.classList.toggle('is-win', winCells.includes(index));
      cell.classList.toggle('is-new', index === lastIndex);
    });
    const locked = over || (vsComputer && current === 1);
    dropButtons.forEach((button, col) => {
      button.disabled = locked || board[0][col] !== null;
    });
  }

  function turnText() {
    return `Turno de ${symbols[current]} ${names[current]}`;
  }

  function startGame() {
    window.clearTimeout(computerTimer);
    board = createBoard();
    over = false;
    current = starter;
    lastIndex = -1;
    status.textContent = turnText();
    render();
    if (vsComputer && current === 1) scheduleComputer();
  }

  function startMode(mode) {
    vsComputer = mode === 'computer';
    names = vsComputer ? ['Tú', 'Computadora'] : ['Jugador 1', 'Jugador 2'];
    wins = [0, 0];
    draws = 0;
    starter = 0;
    menu.hidden = true;
    game.hidden = false;
    renderScore();
    startGame();
  }

  function play(col) {
    const row = dropRow(board, col);
    if (row < 0) return;
    board[row][col] = current;
    lastIndex = row * cols + col;
    const win = findWin(board);
    if (win || !validCols(board).length) {
      over = true;
      if (win) {
        wins[win.player] += 1;
        status.textContent = vsComputer
          ? (win.player === 0 ? '🎉 ¡Ganaste!' : 'La computadora ganó.')
          : `🎉 ¡Ganó ${symbols[win.player]} ${names[win.player]}!`;
        if (!vsComputer || win.player === 0) window.launchConfetti?.();
      } else {
        draws += 1;
        status.textContent = '¡Empate!';
      }
      starter = 1 - starter;
      renderScore();
      render(win ? win.cells : []);
      againButton.focus();
      return;
    }
    current = 1 - current;
    status.textContent = turnText();
    render();
    if (vsComputer && current === 1) scheduleComputer();
  }

  function scheduleComputer() {
    computerTimer = window.setTimeout(() => play(bestColumn(board, 1)), 600);
  }

  function humanMove(col) {
    if (over || (vsComputer && current === 1)) return;
    play(col);
  }

  section.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => startMode(button.dataset.mode));
  });
  againButton.addEventListener('click', startGame);
  backButton.addEventListener('click', () => {
    window.clearTimeout(computerTimer);
    game.hidden = true;
    menu.hidden = false;
  });
}
