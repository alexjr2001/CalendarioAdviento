const boxes = 5;
const size = boxes * 2 + 1;
const symbols = ['🎅', '🎄'];

function createLines() {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function boxSides(lines, r, c) {
  const sides = [lines[2 * r][2 * c + 1], lines[2 * r + 2][2 * c + 1], lines[2 * r + 1][2 * c], lines[2 * r + 1][2 * c + 2]];
  return sides.filter(side => side !== null).length;
}

// Boxes adjacent to an edge, as [row, col] pairs.
function adjacentBoxes(gr, gc) {
  const result = [];
  if (gr % 2 === 0) {
    if (gr > 0) result.push([gr / 2 - 1, (gc - 1) / 2]);
    if (gr < size - 1) result.push([gr / 2, (gc - 1) / 2]);
  } else {
    if (gc > 0) result.push([(gr - 1) / 2, gc / 2 - 1]);
    if (gc < size - 1) result.push([(gr - 1) / 2, gc / 2]);
  }
  return result;
}

function openEdges(lines) {
  const edges = [];
  for (let gr = 0; gr < size; gr += 1) {
    for (let gc = 0; gc < size; gc += 1) {
      if ((gr + gc) % 2 === 1 && lines[gr][gc] === null) edges.push([gr, gc]);
    }
  }
  return edges;
}

function completedBy(lines, gr, gc) {
  return adjacentBoxes(gr, gc).filter(([r, c]) => boxSides(lines, r, c) === 3);
}

// Boxes the opponent could chain-capture after `edge` is drawn.
function sacrificeSize(lines, edge) {
  const copy = lines.map(row => [...row]);
  copy[edge[0]][edge[1]] = 0;
  let captured = 0;
  let progress = true;
  while (progress) {
    progress = false;
    for (const [gr, gc] of openEdges(copy)) {
      const done = completedBy(copy, gr, gc).length;
      if (done) {
        copy[gr][gc] = 1;
        captured += done;
        progress = true;
        break;
      }
    }
  }
  return captured;
}

function computerEdge(lines) {
  const edges = openEdges(lines);
  const capturing = edges.filter(([gr, gc]) => completedBy(lines, gr, gc).length);
  if (capturing.length) return capturing[Math.floor(Math.random() * capturing.length)];
  const safe = edges.filter(([gr, gc]) => adjacentBoxes(gr, gc).every(([r, c]) => boxSides(lines, r, c) < 2));
  if (safe.length) return safe[Math.floor(Math.random() * safe.length)];
  const costs = edges.map(edge => sacrificeSize(lines, edge));
  const least = Math.min(...costs);
  const choices = edges.filter((_, index) => costs[index] === least);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function mountDotsAndBoxes(container) {
  const section = document.createElement('section');
  section.className = 'dots-section activity-section';
  section.innerHTML = '<p class="dots-eyebrow">Juego navideño</p><h2>Puntos y cuadrados</h2>'
    + '<div class="dots-menu"><p class="dots-notice">Traza líneas por turnos entre los puntos. Quien cierre un cuadrado se lo queda y vuelve a jugar. Gana quien consiga más cuadrados.</p><div class="dots-options"><button type="button" data-mode="computer">🎄 Contra la computadora</button><button type="button" data-mode="friend">🎅 Contra otra persona</button></div></div>'
    + '<div class="dots-game" hidden><p class="dots-score" aria-live="polite"></p><div class="dots-board"></div><p class="dots-status" aria-live="polite"></p><div class="dots-actions"><button class="dots-again" type="button">Jugar otra vez</button><button class="dots-back" type="button">Menú</button></div></div>';
  container.appendChild(section);

  const menu = section.querySelector('.dots-menu');
  const game = section.querySelector('.dots-game');
  const boardEl = section.querySelector('.dots-board');
  const scoreEl = section.querySelector('.dots-score');
  const status = section.querySelector('.dots-status');
  const againButton = section.querySelector('.dots-again');
  const backButton = section.querySelector('.dots-back');

  const track = Array.from({ length: size }, (_, index) => (index % 2 ? '1fr' : 'var(--dot)')).join(' ');
  boardEl.style.gridTemplateColumns = track;
  boardEl.style.gridTemplateRows = track;

  const cellEls = Array.from({ length: size }, () => Array(size).fill(null));
  for (let gr = 0; gr < size; gr += 1) {
    for (let gc = 0; gc < size; gc += 1) {
      let el;
      if (gr % 2 === 0 && gc % 2 === 0) {
        el = document.createElement('span');
        el.className = 'dots-dot';
      } else if ((gr + gc) % 2 === 1) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = `dots-edge ${gr % 2 === 0 ? 'is-horizontal' : 'is-vertical'}`;
        el.setAttribute('aria-label', `Línea ${gr % 2 === 0 ? 'horizontal' : 'vertical'}, fila ${Math.floor(gr / 2) + 1}, columna ${Math.floor(gc / 2) + 1}`);
        el.addEventListener('click', () => humanMove(gr, gc));
      } else {
        el = document.createElement('span');
        el.className = 'dots-box';
      }
      cellEls[gr][gc] = el;
      boardEl.appendChild(el);
    }
  }

  let vsComputer = true;
  let names = ['Tú', 'Computadora'];
  let lines = createLines();
  let owners = [];
  let current = 0;
  let scores = [0, 0];
  let totals = [0, 0];
  let draws = 0;
  let starter = 0;
  let over = false;
  let lastEdge = null;
  let computerTimer = 0;

  function renderScore() {
    scoreEl.textContent = `${symbols[0]} ${names[0]} ${scores[0]} : ${scores[1]} ${names[1]} ${symbols[1]}`;
  }

  function turnText() {
    return `Turno de ${symbols[current]} ${names[current]}`;
  }

  function render() {
    const locked = over || (vsComputer && current === 1);
    for (let gr = 0; gr < size; gr += 1) {
      for (let gc = 0; gc < size; gc += 1) {
        const el = cellEls[gr][gc];
        if ((gr + gc) % 2 === 1) {
          const owner = lines[gr][gc];
          el.dataset.player = owner === null ? '' : owner;
          el.disabled = locked || owner !== null;
          el.classList.toggle('is-last', Boolean(lastEdge) && lastEdge[0] === gr && lastEdge[1] === gc);
        } else if (gr % 2 === 1 && gc % 2 === 1) {
          const owner = owners[(gr - 1) / 2][(gc - 1) / 2];
          el.dataset.player = owner === null ? '' : owner;
          el.textContent = owner === null ? '' : symbols[owner];
        }
      }
    }
  }

  function startGame() {
    window.clearTimeout(computerTimer);
    lines = createLines();
    owners = Array.from({ length: boxes }, () => Array(boxes).fill(null));
    scores = [0, 0];
    current = starter;
    over = false;
    lastEdge = null;
    status.textContent = turnText();
    renderScore();
    render();
    if (vsComputer && current === 1) scheduleComputer();
  }

  function startMode(mode) {
    vsComputer = mode === 'computer';
    names = vsComputer ? ['Tú', 'Computadora'] : ['Jugador 1', 'Jugador 2'];
    totals = [0, 0];
    draws = 0;
    starter = 0;
    menu.hidden = true;
    game.hidden = false;
    startGame();
  }

  function draw(gr, gc) {
    lines[gr][gc] = current;
    lastEdge = [gr, gc];
    const closed = adjacentBoxes(gr, gc).filter(([r, c]) => boxSides(lines, r, c) === 4);
    closed.forEach(([r, c]) => {
      owners[r][c] = current;
      scores[current] += 1;
    });
    renderScore();

    if (scores[0] + scores[1] === boxes * boxes) {
      over = true;
      const winner = scores[0] > scores[1] ? 0 : 1;
      totals[winner] += 1;
      status.textContent = vsComputer
        ? (winner === 0 ? '🎉 ¡Ganaste!' : 'La computadora ganó.')
        : `🎉 ¡Ganó ${symbols[winner]} ${names[winner]}!`;
      if (!vsComputer || winner === 0) window.launchConfetti?.();
      starter = 1 - starter;
      render();
      againButton.focus();
      return;
    }

    if (!closed.length) current = 1 - current;
    status.textContent = closed.length ? `${turnText()} \u2013 nochmal!` : turnText();
    render();
    if (vsComputer && current === 1) scheduleComputer();
  }

  function scheduleComputer() {
    computerTimer = window.setTimeout(() => {
      const [gr, gc] = computerEdge(lines);
      draw(gr, gc);
    }, 600);
  }

  function humanMove(gr, gc) {
    if (over || lines[gr][gc] !== null || (vsComputer && current === 1)) return;
    draw(gr, gc);
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
