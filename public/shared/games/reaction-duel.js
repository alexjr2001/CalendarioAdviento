const winScore = 3;
const roundPause = 3500;
const levels = {
  easy: { label: 'Fácil', min: 260, max: 350 },
  medium: { label: 'Intermedio', min: 230, max: 320 },
  hard: { label: 'Difícil', min: 215, max: 270 }
};

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export default function mountReactionDuel(container) {
  const section = document.createElement('section');
  section.className = 'reaction-duel-section activity-section';
  section.innerHTML = '<p class="reaction-duel-eyebrow">Duelo de reflejos</p><h2>¿Quién toca primero?</h2>'
    + '<div class="reaction-duel-menu"><p class="reaction-duel-notice">Necesitas un oponente: juega con otra persona en la misma pantalla o contra la computadora.</p><div class="reaction-duel-modes"><button type="button" data-mode="friend">🎅 Contra otra persona</button><button type="button" data-mode="computer">🦌 Contra la computadora</button></div><div class="reaction-duel-levels" hidden><p class="reaction-duel-levels-title">Elige la dificultad de la computadora</p><div class="reaction-duel-modes reaction-duel-modes-three"><button type="button" data-level="easy">⭐ Fácil</button><button type="button" data-level="medium">⭐⭐ Intermedio</button><button type="button" data-level="hard">⭐⭐⭐ Difícil</button></div></div></div>'
    + '<div class="reaction-duel-game" hidden><p class="reaction-duel-intro">Espera a que suene la campana y toca tu lado. Si tocas antes de tiempo, pierdes un punto. Gana quien llegue primero a 3 puntos.</p><div class="reaction-duel-score" aria-live="polite"></div><div class="reaction-duel-arena"><button type="button" class="reaction-duel-zone" data-player="0"></button><button type="button" class="reaction-duel-zone" data-player="1"></button></div><p class="reaction-duel-status" aria-live="polite"></p></div>'
    + '<div class="reaction-duel-result" aria-live="polite" hidden><p class="reaction-duel-result-title">¡Juego terminado!</p><p class="reaction-duel-result-winner"></p><p class="reaction-duel-result-score"></p></div>'
    + '<div class="reaction-duel-footer"><button class="reaction-duel-new" type="button" hidden>Nuevo duelo</button></div>';
  container.appendChild(section);

  const menu = section.querySelector('.reaction-duel-menu');
  const modes = section.querySelector('.reaction-duel-modes');
  const levelPicker = section.querySelector('.reaction-duel-levels');
  const game = section.querySelector('.reaction-duel-game');
  const scoreEl = section.querySelector('.reaction-duel-score');
  const zones = [...section.querySelectorAll('.reaction-duel-zone')];
  const status = section.querySelector('.reaction-duel-status');
  const result = section.querySelector('.reaction-duel-result');
  const resultWinner = section.querySelector('.reaction-duel-result-winner');
  const resultScore = section.querySelector('.reaction-duel-result-score');
  const newButton = section.querySelector('.reaction-duel-new');

  let vsComputer = false;
  let level = levels.medium;
  let names = [];
  let icons = ['🎅', '🧝'];
  let scores = [0, 0];
  let phase = 'idle';
  let goTime = 0;
  let computerDelay = 0;
  let pendingLoser = null;
  let timers = [];

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function later(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function renderScore() {
    scoreEl.textContent = `${names[0]} ${scores[0]} : ${scores[1]} ${names[1]}`;
  }

  function setZones(state) {
    zones.forEach((zone, index) => {
      zone.dataset.state = state;
      const label = state === 'go' ? '¡YA!' : names[index];
      const symbol = state === 'go' ? '🔔' : state === 'waiting' ? '❄️' : icons[index];
      zone.innerHTML = `<span class="reaction-duel-symbol">${symbol}</span><span class="reaction-duel-name">${label}</span>`;
    });
  }

  function startMode(computer) {
    vsComputer = computer;
    names = computer ? ['Tú', `Computadora (${level.label})`] : ['Jugador 1', 'Jugador 2'];
    icons = computer ? ['🎅', '🦌'] : ['🎅', '🧝'];
    scores = [0, 0];
    menu.hidden = true;
    result.hidden = true;
    game.hidden = false;
    section.classList.remove('is-finished');
    newButton.hidden = false;
    zones[1].disabled = computer;
    renderScore();
    startRound();
  }

  function startRound() {
    clearTimers();
    phase = 'waiting';
    setZones('waiting');
    status.textContent = 'Espera a que suene la campana…';
    later(signal, randomInt(1500, 4500));
  }

  function signal() {
    phase = 'go';
    goTime = performance.now();
    setZones('go');
    status.textContent = '¡Toca ahora!';
    if (vsComputer) {
      computerDelay = randomInt(level.min, level.max);
      later(() => handleTap(1), computerDelay);
    }
  }

  function awardPoint(winner, message, reactionRound = false) {
    clearTimers();
    phase = 'between';
    pendingLoser = null;
    if (reactionRound) {
      const loser = 1 - winner;
      if (vsComputer && loser === 1) message += ` · ${names[1]}: ${computerDelay} ms`;
      else pendingLoser = { player: loser, message };
    }
    scores[winner] += 1;
    renderScore();
    status.innerHTML = message;
    zones.forEach((zone, index) => {
      zone.dataset.state = index === winner ? 'won' : 'lost';
    });
    if (scores[winner] >= winScore) later(() => finish(winner), roundPause);
    else later(startRound, roundPause);
  }

  function handleTap(player) {
    const other = 1 - player;
    if (phase === 'waiting') {
      awardPoint(other, `¡${names[player]} se adelantó! Punto para ${names[other]}.`);
    } else if (phase === 'go') {
      const ms = Math.round(performance.now() - goTime);
      awardPoint(player, `<strong>${names[player]}: ${ms} ms</strong>`, true);
    } else if (phase === 'between' && pendingLoser?.player === player) {
      const ms = Math.round(performance.now() - goTime);
      status.innerHTML = `${pendingLoser.message} · ${names[player]}: ${ms} ms`;
      pendingLoser = null;
    }
  }

  function finish(winner) {
    phase = 'idle';
    game.hidden = true;
    section.classList.add('is-finished');
    resultWinner.textContent = vsComputer
      ? (winner === 0 ? '🎄 ¡Ganaste!' : '🦌 ¡Ganó la computadora!')
      : `🎄 ¡Ganó ${names[winner]}!`;
    resultScore.textContent = `${scores[0]} : ${scores[1]}`;
    result.hidden = false;
    if (!vsComputer || winner === 0) window.launchConfetti?.();
    newButton.focus();
  }

  zones.forEach((zone, index) => {
    zone.addEventListener('pointerdown', event => {
      event.preventDefault();
      handleTap(index);
    });
  });

  section.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.mode === 'computer') {
        modes.hidden = true;
        levelPicker.hidden = false;
      } else {
        startMode(false);
      }
    });
  });

  section.querySelectorAll('[data-level]').forEach(button => {
    button.addEventListener('click', () => {
      level = levels[button.dataset.level];
      startMode(true);
    });
  });

  newButton.addEventListener('click', () => {
    modes.hidden = false;
    levelPicker.hidden = true;
    clearTimers();
    phase = 'idle';
    game.hidden = true;
    result.hidden = true;
    section.classList.remove('is-finished');
    menu.hidden = false;
    newButton.hidden = true;
  });
}
