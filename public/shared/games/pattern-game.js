const pool = ['🎄', '🎁', '⭐', '🔔', '🍪', '⛄', '🦌', '🧦', '🍬', '❄️', '🎅', '🕯️'];
const totalRounds = 8;
const unknown = '❓';

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function pick(count) {
  return shuffle(pool).slice(0, count);
}

function symbolOptions(used, answer, total) {
  const others = shuffle(used.filter(symbol => symbol !== answer));
  const extras = shuffle(pool.filter(symbol => !used.includes(symbol)));
  return shuffle([answer, ...others, ...extras].slice(0, total));
}

function makeSequence(items, answer, used, rule, options = 5) {
  return { kind: 'sequence', items, answer, options: symbolOptions(used, answer, options), rule };
}

function cyclePattern() {
  const [a, b, c] = pick(3);
  const block = shuffle([a, a, b, c]);
  const items = Array.from({ length: 10 }, (_, index) => block[index % 4]);
  return makeSequence(items, block[10 % 4], [a, b, c], `Se repite una secuencia de cuatro símbolos (${block.join(' ')}).`);
}

function bouncePattern() {
  const symbols = pick(4);
  const order = [0, 1, 2, 3, 2, 1];
  const items = Array.from({ length: 10 }, (_, index) => symbols[order[index % 6]]);
  return makeSequence(items, symbols[order[10 % 6]], symbols, 'La secuencia avanza y luego retrocede, como una pelota de ping-pong.');
}

function growingPattern() {
  const symbols = pick(4);
  const items = [symbols[0], symbols[1], symbols[1], symbols[2], symbols[2], symbols[2], symbols[3], symbols[3]];
  return makeSequence(items, symbols[3], symbols, 'Cada símbolo aparece una vez más que el anterior: 1, 2, 3, 4…');
}

function interleavedPattern(aLength, bLength, options) {
  const symbols = pick(aLength + bLength);
  const first = symbols.slice(0, aLength);
  const second = symbols.slice(aLength);
  const valueAt = index => (index % 2 === 0 ? first[(index / 2) % aLength] : second[((index - 1) / 2) % bLength]);
  const items = Array.from({ length: 13 }, (_, index) => valueAt(index));
  return makeSequence(items, valueAt(13), symbols, `Se alternan dos secuencias: las posiciones 1, 3, 5… repiten ${aLength} símbolos y las posiciones 2, 4, 6… repiten ${bLength} símbolos.`, options);
}

function matrixPattern() {
  const symbols = pick(4);
  const rows = Array.from({ length: 4 }, (_, row) => Array.from({ length: 4 }, (_, col) => symbols[(col + row) % 4]));
  const hiddenRow = 2 + Math.floor(Math.random() * 2);
  const hiddenCol = Math.floor(Math.random() * 4);
  const answer = rows[hiddenRow][hiddenCol];
  const items = rows.map((row, r) => row.map((symbol, c) => (r === hiddenRow && c === hiddenCol ? unknown : symbol)));
  return { kind: 'matrix', items, answer, options: symbolOptions(symbols, answer, 5), rule: 'Cada fila se obtiene desplazando una posición a la izquierda los símbolos de la fila anterior.' };
}

const countRules = {
  double: { values: [1, 2, 4, 8], next: 16, rule: 'La cantidad se duplica en cada grupo.' },
  alternating: { values: [2, 4, 7, 9, 12], next: 14, rule: 'Se suman 2 y 3 alternadamente: +2, +3, +2, +3…' },
  fibonacci: { values: [1, 1, 2, 3, 5], next: 8, rule: 'Cada grupo es la suma de los dos anteriores (Fibonacci).' },
  triangle: { values: [1, 3, 6, 10], next: 15, rule: 'Se añade un símbolo más cada vez: +2, +3, +4, +5…' },
  squares: { values: [1, 4, 9, 16], next: 25, rule: 'Las cantidades son números cuadrados: 1×1, 2×2, 3×3, 4×4…' }
};

function countsPattern(keys) {
  const key = keys[Math.floor(Math.random() * keys.length)];
  const { values, next, rule } = countRules[key];
  const symbol = pick(1)[0];
  const wrong = shuffle([next - 1, next + 1, next - 2, next + 2, next + 3, next * 2, next - 3].filter(value => value > 0 && value !== next)).slice(0, 4);
  return {
    kind: 'counts',
    symbol,
    items: values,
    answer: next,
    options: shuffle([next, ...wrong]),
    rule
  };
}

const builders = [
  matrixPattern,
  cyclePattern,
  bouncePattern,
  growingPattern,
  () => countsPattern(['double', 'alternating']),
  () => interleavedPattern(3, 2, 5),
  () => countsPattern(['fibonacci', 'triangle', 'squares']),
  () => interleavedPattern(3, 4, 6)
];

export default function mountPatternGame(container) {
  const section = document.createElement('section');
  section.className = 'pattern-section activity-section';
  section.innerHTML = '<p class="pattern-eyebrow">Reto de ingenio</p><h2>Completa el patrón</h2>'
    + '<div class="pattern-game"><p class="pattern-intro">Descubre la regla del patrón y elige qué va en lugar del signo de interrogación. Solo tienes un intento por reto: ¡piénsalo bien!</p><p class="pattern-progress" aria-live="polite"></p><div class="pattern-board" role="img"></div><div class="pattern-options" role="group" aria-label="Respuestas"></div><p class="pattern-feedback" aria-live="polite"></p><button class="pattern-next" type="button" hidden>Siguiente</button></div>'
    + '<div class="pattern-result" aria-live="polite" hidden><p class="pattern-result-title">¡Juego terminado!</p><p class="pattern-result-score"></p><p class="pattern-result-note"></p><button class="pattern-again" type="button">Jugar otra vez</button></div>';
  container.appendChild(section);

  const game = section.querySelector('.pattern-game');
  const progress = section.querySelector('.pattern-progress');
  const board = section.querySelector('.pattern-board');
  const optionsEl = section.querySelector('.pattern-options');
  const feedback = section.querySelector('.pattern-feedback');
  const nextButton = section.querySelector('.pattern-next');
  const result = section.querySelector('.pattern-result');
  const resultScore = section.querySelector('.pattern-result-score');
  const resultNote = section.querySelector('.pattern-result-note');
  const againButton = section.querySelector('.pattern-again');

  let roundIndex = 0;
  let score = 0;
  let question = null;
  let answered = false;

  function cell(content, className = '') {
    const span = document.createElement('span');
    span.className = `pattern-cell ${className}`.trim();
    span.textContent = content;
    return span;
  }

  function renderBoard() {
    board.replaceChildren();
    board.className = `pattern-board is-${question.kind}`;
    if (question.kind === 'sequence') {
      question.items.forEach(item => board.appendChild(cell(item)));
      board.appendChild(cell(unknown, 'is-unknown'));
    } else if (question.kind === 'matrix') {
      board.style.gridTemplateColumns = 'repeat(4,1fr)';
      question.items.flat().forEach(item => board.appendChild(cell(item, item === unknown ? 'is-unknown' : '')));
    } else {
      question.items.forEach(count => {
        const group = document.createElement('span');
        group.className = 'pattern-group';
        group.textContent = question.symbol.repeat(count);
        board.appendChild(group);
      });
      const unknownGroup = document.createElement('span');
      unknownGroup.className = 'pattern-group is-unknown';
      unknownGroup.textContent = unknown;
      board.appendChild(unknownGroup);
    }
    if (question.kind !== 'matrix') board.style.gridTemplateColumns = '';
  }

  function renderOptions() {
    optionsEl.replaceChildren();
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pattern-option';
      button.dataset.value = option;
      button.textContent = option;
      button.addEventListener('click', () => answer(option, button));
      optionsEl.appendChild(button);
    });
  }

  function startRound() {
    question = builders[roundIndex]();
    answered = false;
    progress.textContent = `Reto ${roundIndex + 1} / ${totalRounds} · ${score} correctos`;
    feedback.textContent = question.kind === 'counts' ? '¿Cuántos símbolos van en el siguiente grupo?' : '¿Qué va en lugar del signo de interrogación?';
    nextButton.hidden = true;
    renderBoard();
    renderOptions();
  }

  function answer(option, button) {
    if (answered) return;
    answered = true;
    const right = String(option) === String(question.answer);
    if (right) score += 1;
    optionsEl.querySelectorAll('button').forEach(item => {
      item.disabled = true;
      if (item.dataset.value === String(question.answer)) item.classList.add('is-correct');
    });
    if (!right) button.classList.add('is-wrong');
    const unknownEl = board.querySelector('.is-unknown');
    if (unknownEl) {
      unknownEl.textContent = question.kind === 'counts' ? question.symbol.repeat(question.answer) : question.answer;
      unknownEl.classList.add('is-solved');
    }
    feedback.textContent = `${right ? '🎉 ¡Correcto!' : 'No es correcto.'} ${question.rule}`;
    progress.textContent = `Reto ${roundIndex + 1} / ${totalRounds} · ${score} correctos`;
    nextButton.textContent = roundIndex + 1 >= totalRounds ? 'Ver resultado' : 'Siguiente';
    nextButton.hidden = false;
    nextButton.focus();
  }

  function finish() {
    game.hidden = true;
    resultScore.textContent = `${score} / ${totalRounds}`;
    resultNote.textContent = score === totalRounds ? '¡Perfecto! Reconociste todos los patrones.' : score >= 5 ? '¡Qué buena lógica!' : 'La práctica hace al maestro. ¡Inténtalo otra vez!';
    result.hidden = false;
    if (score >= 6) window.launchConfetti?.();
    againButton.focus();
  }

  function startGame() {
    roundIndex = 0;
    score = 0;
    game.hidden = false;
    result.hidden = true;
    startRound();
  }

  nextButton.addEventListener('click', () => {
    roundIndex += 1;
    if (roundIndex >= totalRounds) finish();
    else startRound();
  });
  againButton.addEventListener('click', startGame);
  startGame();
}
