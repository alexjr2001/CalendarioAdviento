const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const symbols = ['🎄', '⛄'];

function findWinner(board) {
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) return { player: board[a], line };
  }
  return null;
}

function emptyCells(board) {
  return board.flatMap((value, index) => (value === null ? [index] : []));
}

// Score from the computer's (player 1) perspective; shallower wins score higher.
function minimax(board, player, depth) {
  const winner = findWinner(board);
  if (winner) return winner.player === 1 ? 10 - depth : depth - 10;
  const moves = emptyCells(board);
  if (!moves.length) return 0;
  const scores = moves.map(move => {
    board[move] = player;
    const score = minimax(board, 1 - player, depth + 1);
    board[move] = null;
    return score;
  });
  return player === 1 ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(board) {
  let best = -Infinity;
  let choices = [];
  for (const move of emptyCells(board)) {
    board[move] = 1;
    const score = minimax(board, 0, 1);
    board[move] = null;
    if (score > best) {
      best = score;
      choices = [move];
    } else if (score === best) {
      choices.push(move);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

function randomMove(board) {
  const moves = emptyCells(board);
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function mountChristmasTicTacToe(container) {
  const section = document.createElement('section');
  section.className = 'tictactoe-section activity-section';
  section.innerHTML = '<p class="tictactoe-eyebrow">Juego navideño</p><h2>Tres en raya navideño</h2>'
    + '<div class="tictactoe-menu"><p class="tictactoe-notice">Juega con otra persona en la misma pantalla o contra la computadora.</p><div class="tictactoe-options"><button type="button" data-mode="friend">🎅 Contra otra persona</button><button type="button" data-mode="easy">🦌 Computadora: fácil</button><button type="button" data-mode="impossible">👹 Computadora: invencible</button></div></div>'
    + '<div class="tictactoe-game" hidden><p class="tictactoe-score" aria-live="polite"></p><div class="tictactoe-board" role="grid"></div><p class="tictactoe-status" aria-live="polite"></p><div class="tictactoe-actions"><button class="tictactoe-again" type="button">Jugar otra vez</button><button class="tictactoe-back" type="button">Menú</button></div></div>';
  container.appendChild(section);

  const menu = section.querySelector('.tictactoe-menu');
  const game = section.querySelector('.tictactoe-game');
  const boardEl = section.querySelector('.tictactoe-board');
  const status = section.querySelector('.tictactoe-status');
  const scoreEl = section.querySelector('.tictactoe-score');
  const againButton = section.querySelector('.tictactoe-again');
  const backButton = section.querySelector('.tictactoe-back');

  const cells = Array.from({ length: 9 }, (_, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'tictactoe-cell';
    cell.setAttribute('aria-label', `Casilla ${index + 1}`);
    cell.addEventListener('click', () => humanMove(index));
    boardEl.appendChild(cell);
    return cell;
  });

  let mode = 'friend';
  let names = ['Jugador 1', 'Jugador 2'];
  let board = [];
  let current = 0;
  let over = false;
  let wins = [0, 0];
  let draws = 0;
  let starter = 0;
  let computerTimer = 0;

  function vsComputer() {
    return mode !== 'friend';
  }

  function renderScore() {
    scoreEl.textContent = `${symbols[0]} ${names[0]} ${wins[0]} · Empates ${draws} · ${wins[1]} ${names[1]} ${symbols[1]}`;
  }

  function render(winLine = []) {
    cells.forEach((cell, index) => {
      cell.textContent = board[index] === null ? '' : symbols[board[index]];
      cell.disabled = over || board[index] !== null || (vsComputer() && current === 1);
      cell.classList.toggle('is-win', winLine.includes(index));
    });
  }

  function startGame() {
    window.clearTimeout(computerTimer);
    board = Array(9).fill(null);
    over = false;
    current = starter;
    status.textContent = `Turno de ${symbols[current]} ${names[current]}`;
    render();
    if (vsComputer() && current === 1) scheduleComputer();
  }

  function startMode(nextMode) {
    mode = nextMode;
    names = vsComputer() ? ['Tú', 'Computadora'] : ['Jugador 1', 'Jugador 2'];
    wins = [0, 0];
    draws = 0;
    starter = 0;
    menu.hidden = true;
    game.hidden = false;
    renderScore();
    startGame();
  }

  function place(index) {
    board[index] = current;
    const winner = findWinner(board);
    if (winner || !emptyCells(board).length) {
      over = true;
      if (winner) {
        wins[winner.player] += 1;
        status.textContent = vsComputer()
          ? (winner.player === 0 ? '🎉 ¡Ganaste!' : 'La computadora ganó.')
          : `🎉 ¡Ganó ${symbols[winner.player]} ${names[winner.player]}!`;
        if (!vsComputer() || winner.player === 0) window.launchConfetti?.();
      } else {
        draws += 1;
        status.textContent = '¡Empate!';
      }
      starter = 1 - starter;
      renderScore();
      render(winner ? winner.line : []);
      againButton.focus();
      return;
    }
    current = 1 - current;
    status.textContent = `Turno de ${symbols[current]} ${names[current]}`;
    render();
    if (vsComputer() && current === 1) scheduleComputer();
  }

  function scheduleComputer() {
    computerTimer = window.setTimeout(() => {
      place(mode === 'easy' ? randomMove(board) : bestMove(board));
    }, 600);
  }

  function humanMove(index) {
    if (over || board[index] !== null || (vsComputer() && current === 1)) return;
    place(index);
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
