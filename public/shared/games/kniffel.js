const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const diceCount = 5;
const maxRolls = 3;
const bonusThreshold = 63;
const bonusPoints = 35;
const icons = ['🎅', '🧝', '🦌', '⛄'];

const upper = [
  { key: 'ones', label: 'Unos', value: 1 },
  { key: 'twos', label: 'Doses', value: 2 },
  { key: 'threes', label: 'Treses', value: 3 },
  { key: 'fours', label: 'Cuatros', value: 4 },
  { key: 'fives', label: 'Cincos', value: 5 },
  { key: 'sixes', label: 'Seises', value: 6 }
];

const lower = [
  { key: 'threeKind', label: 'Trío' },
  { key: 'fourKind', label: 'Póker' },
  { key: 'fullHouse', label: 'Full' },
  { key: 'smallStraight', label: 'Escalera corta' },
  { key: 'largeStraight', label: 'Escalera larga' },
  { key: 'kniffel', label: 'Generala' },
  { key: 'chance', label: 'Oportunidad' }
];

const categories = [...upper, ...lower];

// Typical score per row; the computer picks the row where it beats this the most.
const par = {
  ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18,
  threeKind: 18, fourKind: 10, fullHouse: 12, smallStraight: 20, largeStraight: 12, kniffel: 4, chance: 22
};

function hasRun(values, length) {
  const unique = new Set(values);
  for (let start = 1; start + length - 1 <= 6; start += 1) {
    if (Array.from({ length }, (_, offset) => start + offset).every(value => unique.has(value))) return true;
  }
  return false;
}

function scoreFor(key, dice) {
  const sum = dice.reduce((total, value) => total + value, 0);
  const counts = Array(7).fill(0);
  dice.forEach(value => { counts[value] += 1; });
  const most = Math.max(...counts);
  const upperEntry = upper.find(entry => entry.key === key);
  if (upperEntry) return counts[upperEntry.value] * upperEntry.value;
  switch (key) {
    case 'threeKind': return most >= 3 ? sum : 0;
    case 'fourKind': return most >= 4 ? sum : 0;
    case 'fullHouse': return counts.includes(3) && counts.includes(2) ? 25 : 0;
    case 'smallStraight': return hasRun(dice, 4) ? 30 : 0;
    case 'largeStraight': return hasRun(dice, 5) ? 40 : 0;
    case 'kniffel': return most === 5 ? 50 : 0;
    default: return sum;
  }
}

function bestCategory(dice, filled) {
  let best = null;
  let bestValue = -Infinity;
  for (const entry of categories) {
    if (entry.key in filled) continue;
    const value = scoreFor(entry.key, dice) - par[entry.key];
    if (value > bestValue) {
      bestValue = value;
      best = entry.key;
    }
  }
  return best;
}

function computerWantsToStop(dice, filled) {
  const key = bestCategory(dice, filled);
  return ['kniffel', 'largeStraight', 'fullHouse'].includes(key) && scoreFor(key, dice) > 0;
}

function computerHolds(dice, filled) {
  const open = key => !(key in filled);
  if ((open('largeStraight') || open('smallStraight')) && hasRun(dice, 4)) {
    const seen = new Set();
    const run = [1, 2, 3].find(start => [0, 1, 2, 3].every(offset => dice.includes(start + offset)));
    return dice.map(value => {
      const keep = value >= run && value <= run + 3 && !seen.has(value);
      if (keep) seen.add(value);
      return keep;
    });
  }
  const counts = Array(7).fill(0);
  dice.forEach(value => { counts[value] += 1; });
  let target = 6;
  for (let value = 6; value >= 1; value -= 1) if (counts[value] > counts[target]) target = value;
  return dice.map(value => value === target);
}

export default function mountKniffel(container) {
  const section = document.createElement('section');
  section.className = 'kniffel-section activity-section';
  section.innerHTML = '<p class="kniffel-eyebrow">Juego de dados</p><h2>Generala navideña</h2>'
    + '<div class="kniffel-menu"><p class="kniffel-notice">Juega en solitario, con 2 a 4 personas en la misma pantalla o contra la computadora.</p><div class="kniffel-options"><button type="button" data-players="1">🎲 En solitario</button><button type="button" data-players="2">🎅 2 jugadores</button><button type="button" data-players="3">🎅 3 jugadores</button><button type="button" data-players="4">🎅 4 jugadores</button><button type="button" data-computer="true">🦌 Contra la computadora</button></div></div>'
    + '<div class="kniffel-game" hidden><p class="kniffel-intro">Tira los dados hasta tres veces. Toca los dados que quieras conservar y luego anota el resultado en una categoría disponible.</p><p class="kniffel-turn" aria-live="polite"></p><div class="kniffel-dice"></div><div class="kniffel-controls"><button class="kniffel-roll" type="button">Tirar los dados</button><span class="kniffel-rolls-left"></span></div><p class="kniffel-hint" aria-live="polite"></p><table class="kniffel-sheet"><thead><tr></tr></thead><tbody></tbody></table></div>'
    + '<div class="kniffel-result" aria-live="polite" hidden><p class="kniffel-result-title"></p><p class="kniffel-result-score"></p><p class="kniffel-result-note"></p></div>'
    + '<div class="kniffel-actions"><button class="kniffel-new" type="button" hidden>Nuevo juego</button></div>'
    + '<dialog class="kniffel-confirm"><p>¿Seguro que quieres salir? Perderás tu progreso.</p><div class="kniffel-confirm-actions"><button class="kniffel-confirm-yes" type="button">Sí, salir</button><button class="kniffel-confirm-no" type="button">Seguir jugando</button></div></dialog>';
  container.appendChild(section);

  const menu = section.querySelector('.kniffel-menu');
  const game = section.querySelector('.kniffel-game');
  const turnEl = section.querySelector('.kniffel-turn');
  const diceEl = section.querySelector('.kniffel-dice');
  const rollButton = section.querySelector('.kniffel-roll');
  const rollsLeftEl = section.querySelector('.kniffel-rolls-left');
  const hint = section.querySelector('.kniffel-hint');
  const headRow = section.querySelector('thead tr');
  const body = section.querySelector('tbody');
  const result = section.querySelector('.kniffel-result');
  const resultTitle = section.querySelector('.kniffel-result-title');
  const resultScore = section.querySelector('.kniffel-result-score');
  const resultNote = section.querySelector('.kniffel-result-note');
  const newButton = section.querySelector('.kniffel-new');
  const confirmDialog = section.querySelector('.kniffel-confirm');

  let players = [];
  let current = 0;
  let dice = [1, 1, 1, 1, 1];
  let held = [false, false, false, false, false];
  let rollsLeft = maxRolls;
  let rolled = false;
  let finished = false;
  let timers = [];

  function later(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  const dieButtons = Array.from({ length: diceCount }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kniffel-die';
    button.addEventListener('click', () => {
      if (!rolled || isComputerTurn()) return;
      held[index] = !held[index];
      renderDice();
    });
    diceEl.appendChild(button);
    return button;
  });

  function isComputerTurn() {
    return Boolean(players[current]?.computer);
  }

  function upperSum(player) {
    return upper.reduce((total, entry) => total + (player.filled[entry.key] ?? 0), 0);
  }

  function bonus(player) {
    return upperSum(player) >= bonusThreshold ? bonusPoints : 0;
  }

  function totalScore(player) {
    return Object.values(player.filled).reduce((total, value) => total + value, 0) + bonus(player);
  }

  function renderDice() {
    const locked = !rolled || finished || isComputerTurn();
    dieButtons.forEach((button, index) => {
      button.textContent = rolled ? faces[dice[index] - 1] : '?';
      button.classList.toggle('is-held', held[index]);
      button.setAttribute('aria-pressed', String(held[index]));
      button.setAttribute('aria-label', rolled ? `Dado ${index + 1}: ${dice[index]}${held[index] ? ', guardado' : ''}` : `Dado ${index + 1}`);
      button.disabled = locked;
    });
  }

  function cell(content, className) {
    const td = document.createElement('td');
    if (className) td.className = className;
    if (content instanceof Node) td.appendChild(content);
    else td.textContent = content;
    return td;
  }

  function renderSheet() {
    headRow.replaceChildren();
    const categoryHead = document.createElement('th');
    categoryHead.textContent = 'Categoría';
    headRow.appendChild(categoryHead);
    players.forEach((player, index) => {
      const th = document.createElement('th');
      th.textContent = `${player.icon} ${player.name}`;
      th.classList.toggle('is-current', !finished && index === current);
      headRow.appendChild(th);
    });

    body.replaceChildren();
    const canPick = rolled && !finished && !isComputerTurn();

    function addRow(label, valueFor, className) {
      const row = document.createElement('tr');
      row.className = `kniffel-row ${className ?? ''}`;
      row.appendChild(cell(label, 'kniffel-name'));
      players.forEach((player, index) => {
        const td = valueFor(player, index);
        td.classList.toggle('is-current', !finished && index === current);
        row.appendChild(td);
      });
      body.appendChild(row);
    }

    function categoryCell(entry) {
      return (player, index) => {
        const isFilled = entry.key in player.filled;
        if (isFilled) return cell(player.filled[entry.key], 'kniffel-score is-filled');
        if (index !== current || !rolled) return cell('', 'kniffel-score');
        const potential = scoreFor(entry.key, dice);
        if (!canPick) return cell(potential, 'kniffel-score');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'kniffel-pick';
        button.textContent = potential;
        button.setAttribute('aria-label', `Anotar en ${entry.label}: ${potential} puntos`);
        button.addEventListener('click', () => choose(entry.key));
        return cell(button, 'kniffel-score');
      };
    }

    upper.forEach(entry => addRow(entry.label, categoryCell(entry)));
    addRow('Bonificación (desde 63)', player => cell(bonus(player) ? bonusPoints : `${upperSum(player)} / ${bonusThreshold}`, `kniffel-score${bonus(player) ? ' is-filled' : ''}`));
    lower.forEach(entry => addRow(entry.label, categoryCell(entry)));
    addRow('Total', player => cell(totalScore(player), 'kniffel-score is-filled'), 'kniffel-sum');
  }

  function render() {
    renderDice();
    renderSheet();
    const player = players[current];
    turnEl.textContent = finished || players.length < 2 ? '' : `Turno de ${player.icon} ${player.name}`;
    rollsLeftEl.textContent = `${rollsLeft} ${rollsLeft === 1 ? 'lanzamiento restante' : 'lanzamientos restantes'}`;
    rollButton.disabled = finished || rollsLeft === 0 || isComputerTurn();
    if (finished) hint.textContent = '';
    else if (isComputerTurn()) hint.textContent = 'La computadora está jugando…';
    else if (!rolled) hint.textContent = 'Tira los dados para empezar la ronda.';
    else hint.textContent = rollsLeft ? 'Conserva dados, vuelve a tirar o elige una categoría.' : 'No te quedan lanzamientos: elige una categoría.';
  }

  function rollDice() {
    if (finished || rollsLeft === 0) return;
    dice = dice.map((value, index) => (held[index] ? value : 1 + Math.floor(Math.random() * 6)));
    rolled = true;
    rollsLeft -= 1;
    render();
    dieButtons.forEach((button, index) => {
      if (held[index]) return;
      button.classList.remove('is-rolling');
      void button.offsetWidth;
      button.classList.add('is-rolling');
    });
  }

  function newTurn() {
    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsLeft = maxRolls;
    rolled = false;
    render();
    if (isComputerTurn()) later(computerStep, 900);
  }

  function computerStep() {
    if (finished || !isComputerTurn()) return;
    const player = players[current];
    if (!rolled) {
      rollDice();
      later(computerStep, 1100);
      return;
    }
    if (rollsLeft > 0 && !computerWantsToStop(dice, player.filled)) {
      held = computerHolds(dice, player.filled);
      renderDice();
      later(() => {
        rollDice();
        later(computerStep, 1100);
      }, 800);
      return;
    }
    choose(bestCategory(dice, player.filled));
  }

  function choose(key) {
    const player = players[current];
    if (!rolled || finished || key in player.filled) return;
    player.filled[key] = scoreFor(key, dice);
    current = (current + 1) % players.length;
    if (players.every(entry => Object.keys(entry.filled).length === categories.length)) {
      finish();
      return;
    }
    newTurn();
  }

  function finish() {
    clearTimers();
    finished = true;
    render();
    const scores = players.map(totalScore);
    const top = Math.max(...scores);
    const winners = players.filter((_, index) => scores[index] === top);
    resultTitle.textContent = '¡Juego terminado!';
    if (players.length === 1) {
      resultScore.textContent = top;
      resultNote.textContent = bonus(players[0]) ? `puntos, incluidos ${bonusPoints} puntos de bonificación` : 'puntos';
    } else {
      resultScore.textContent = top;
      const names = winners.map(winner => `${winner.icon} ${winner.name}`).join(' & ');
      resultTitle.textContent = winners.length > 1 ? `Empate: ${names}` : `🏆 ¡${names} gana!`;
      resultNote.textContent = players.map((player, index) => `${player.icon} ${player.name}: ${scores[index]}`).join(' · ');
    }
    result.hidden = false;
    section.classList.add('is-finished');
    const humanWon = winners.some(winner => !winner.computer);
    if (humanWon && (players.length > 1 || top >= 200)) window.launchConfetti?.();
    newButton.focus();
  }

  function startGame(config) {
    clearTimers();
    players = config.computer
      ? [{ name: 'Tú', icon: icons[0], computer: false, filled: {} }, { name: 'Computadora', icon: icons[2], computer: true, filled: {} }]
      : Array.from({ length: config.count }, (_, index) => ({
        name: config.count === 1 ? 'Tú' : `Jugador ${index + 1}`,
        icon: icons[index],
        computer: false,
        filled: {}
      }));
    current = 0;
    finished = false;
    menu.hidden = true;
    result.hidden = true;
    game.hidden = false;
    newButton.hidden = false;
    section.classList.remove('is-finished');
    newTurn();
  }

  section.querySelectorAll('[data-players]').forEach(button => {
    button.addEventListener('click', () => startGame({ count: Number(button.dataset.players) }));
  });
  section.querySelector('[data-computer]').addEventListener('click', () => startGame({ computer: true }));
  rollButton.addEventListener('click', rollDice);
  function backToMenu() {
    clearTimers();
    finished = true;
    game.hidden = true;
    result.hidden = true;
    section.classList.remove('is-finished');
    menu.hidden = false;
    newButton.hidden = true;
  }

  newButton.addEventListener('click', () => {
    if (finished) backToMenu();
    else confirmDialog.showModal();
  });
  section.querySelector('.kniffel-confirm-no').addEventListener('click', () => confirmDialog.close());
  section.querySelector('.kniffel-confirm-yes').addEventListener('click', () => {
    confirmDialog.close();
    backToMenu();
  });
}
