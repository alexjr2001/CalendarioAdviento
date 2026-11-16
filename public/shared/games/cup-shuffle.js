const levels = {
  easy: { label: 'Fácil', cups: 3, swaps: 6, swapMs: 650 },
  medium: { label: 'Intermedio', cups: 4, swaps: 9, swapMs: 420 },
  hard: { label: 'Difícil', cups: 5, swaps: 13, swapMs: 280 }
};
const totalRounds = 5;

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function mountCupShuffle(container) {
  const section = document.createElement('section');
  section.className = 'cups-section activity-section';
  section.innerHTML = '<p class="cups-eyebrow">Juego de concentración</p><h2>¿Dónde está el regalo?</h2>'
    + '<div class="cups-menu"><p class="cups-notice">Recuerda debajo de qué vaso está el regalo y síguelo mientras se mezclan. Elige la dificultad:</p><div class="cups-options"><button type="button" data-level="easy">⭐ Fácil</button><button type="button" data-level="medium">⭐⭐ Intermedio</button><button type="button" data-level="hard">⭐⭐⭐ Difícil</button></div></div>'
    + '<div class="cups-game" hidden><p class="cups-progress" aria-live="polite"></p><div class="cups-stage"></div><p class="cups-status" aria-live="polite"></p><div class="cups-actions"><button class="cups-next" type="button" hidden>Siguiente</button><button class="cups-back" type="button">Menú</button></div></div>'
    + '<div class="cups-result" aria-live="polite" hidden><p class="cups-result-title">¡Juego terminado!</p><p class="cups-result-score"></p><p class="cups-result-note"></p><div class="cups-actions"><button class="cups-again" type="button">Jugar otra vez</button><button class="cups-result-back" type="button">Menú</button></div></div>';
  container.appendChild(section);

  const menu = section.querySelector('.cups-menu');
  const game = section.querySelector('.cups-game');
  const stage = section.querySelector('.cups-stage');
  const progress = section.querySelector('.cups-progress');
  const status = section.querySelector('.cups-status');
  const nextButton = section.querySelector('.cups-next');
  const result = section.querySelector('.cups-result');
  const resultScore = section.querySelector('.cups-result-score');
  const resultNote = section.querySelector('.cups-result-note');

  let level = levels.easy;
  let roundIndex = 0;
  let correct = 0;
  let cups = [];
  let prizeCup = 0;
  let state = 'idle';
  let timers = [];

  function later(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function place(cup) {
    const width = 100 / level.cups;
    cup.el.style.width = `${width - 4}%`;
    cup.el.style.left = `${cup.slot * width + 2}%`;
  }

  function buildCups() {
    stage.replaceChildren();
    prizeCup = randomInt(level.cups);
    cups = Array.from({ length: level.cups }, (_, index) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cups-cup';
      el.dataset.color = level === levels.hard ? 0 : index % 2;
      el.setAttribute('aria-label', `Vaso ${index + 1}`);
      el.innerHTML = `<span class="cups-prize">${index === prizeCup ? '🎁' : ''}</span><span class="cups-body"></span>`;
      const cup = { el, slot: index, body: el.querySelector('.cups-body') };
      el.style.transitionDuration = `${level.swapMs}ms`;
      cup.body.style.transitionDuration = `${level.swapMs}ms`;
      el.addEventListener('click', () => choose(cup, index));
      place(cup);
      stage.appendChild(el);
      return cup;
    });
  }

  function setLifted(cup, lifted) {
    cup.el.classList.toggle('is-lifted', lifted);
  }

  function setInteractive(enabled) {
    cups.forEach(cup => { cup.el.disabled = !enabled; });
  }

  function startRound() {
    clearTimers();
    state = 'reveal';
    nextButton.hidden = true;
    progress.textContent = `Ronda ${roundIndex + 1} / ${totalRounds} · ${correct} correctas`;
    status.textContent = '¡Recuerda qué vaso tiene el regalo!';
    buildCups();
    setInteractive(false);
    later(() => setLifted(cups[prizeCup], true), 500);
    later(() => setLifted(cups[prizeCup], false), 1900);
    later(() => {
      state = 'shuffling';
      status.textContent = 'Sigue el vaso…';
      shuffle(level.swaps);
    }, 2700);
  }

  function shuffle(remaining) {
    if (remaining === 0) {
      state = 'choosing';
      status.textContent = '¿Debajo de qué vaso está el regalo?';
      setInteractive(true);
      return;
    }
    const a = randomInt(level.cups);
    let b = randomInt(level.cups - 1);
    if (b >= a) b += 1;
    const first = cups.find(cup => cup.slot === a);
    const second = cups.find(cup => cup.slot === b);
    first.slot = b;
    second.slot = a;
    place(first);
    place(second);
    first.body.style.transform = 'translateY(-26px)';
    second.body.style.transform = 'translateY(26px)';
    first.el.style.zIndex = 2;
    later(() => {
      first.body.style.transform = '';
      second.body.style.transform = '';
      first.el.style.zIndex = '';
    }, level.swapMs / 2);
    later(() => shuffle(remaining - 1), level.swapMs + 60);
  }

  function choose(cup, index) {
    if (state !== 'choosing') return;
    state = 'done';
    setInteractive(false);
    const hit = index === prizeCup;
    setLifted(cup, true);
    if (hit) {
      correct += 1;
    } else {
      later(() => setLifted(cups[prizeCup], true), 600);
    }
    status.textContent = hit ? '🎉 ¡Correcto! Encontraste el regalo.' : 'No es correcto. El regalo estaba aquí.';
    progress.textContent = `Ronda ${roundIndex + 1} / ${totalRounds} · ${correct} correctas`;
    nextButton.textContent = roundIndex + 1 >= totalRounds ? 'Ver resultado' : 'Siguiente';
    later(() => {
      nextButton.hidden = false;
      nextButton.focus();
    }, hit ? 400 : 1000);
  }

  function finish() {
    clearTimers();
    game.hidden = true;
    resultScore.textContent = `${correct} / ${totalRounds}`;
    resultNote.textContent = `Dificultad: ${level.label}`;
    result.hidden = false;
    if (correct >= 4) window.launchConfetti?.();
    section.querySelector('.cups-again').focus();
  }

  function startGame() {
    roundIndex = 0;
    correct = 0;
    menu.hidden = true;
    result.hidden = true;
    game.hidden = false;
    startRound();
  }

  function backToMenu() {
    clearTimers();
    state = 'idle';
    game.hidden = true;
    result.hidden = true;
    menu.hidden = false;
  }

  section.querySelectorAll('[data-level]').forEach(button => {
    button.addEventListener('click', () => {
      level = levels[button.dataset.level];
      startGame();
    });
  });
  nextButton.addEventListener('click', () => {
    roundIndex += 1;
    if (roundIndex >= totalRounds) finish();
    else startRound();
  });
  section.querySelector('.cups-again').addEventListener('click', startGame);
  section.querySelector('.cups-back').addEventListener('click', backToMenu);
  section.querySelector('.cups-result-back').addEventListener('click', backToMenu);
}
