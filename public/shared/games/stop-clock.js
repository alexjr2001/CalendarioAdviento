const target = 5000;
const totalRounds = 5;
const maxRoundScore = 100;
const nearWindow = 50;
const nearMinPoints = 120;
const nearMaxPoints = 300;
const exactPoints = 700;
const autoStop = 10000;

function format(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${seconds},${String(Math.floor(ms % 1000)).padStart(3, '0')}`;
}

function roundPoints(errorMs) {
  if (errorMs === 0) return exactPoints;
  if (errorMs <= nearWindow) {
    const closeness = (nearWindow - errorMs) / (nearWindow - 1);
    return Math.round(nearMinPoints + closeness * (nearMaxPoints - nearMinPoints));
  }
  return Math.max(0, maxRoundScore - Math.round(errorMs / 10));
}

export default function mountStopClock(container) {
  const section = document.createElement('section');
  section.className = 'stopclock-section activity-section';
  section.innerHTML = '<p class="stopclock-eyebrow">Destreza</p><h2>Detén el reloj</h2>'
    + '<div class="stopclock-game"><p class="stopclock-intro">Inicia el cronómetro y detenlo exactamente en <strong>5,000 segundos</strong>. Cuanto más te acerques, más puntos ganas. Si te desvías menos de 0,050 s, recibes una bonificación; acertar exactamente da muchísimos puntos.</p><div class="stopclock-display" aria-live="off">0,000</div><p class="stopclock-target">Objetivo: 5,000 s</p><button class="stopclock-button" type="button">Empezar</button><button class="stopclock-next" type="button" hidden>Siguiente</button><p class="stopclock-feedback" aria-live="polite"></p><div class="stopclock-footer"><span class="stopclock-progress"></span></div></div>'
    + '<div class="stopclock-result" aria-live="polite" hidden><p class="stopclock-result-title">¡Juego terminado!</p><p class="stopclock-result-score"></p><p class="stopclock-result-note"></p><button class="stopclock-again" type="button">Jugar otra vez</button></div>';
  container.appendChild(section);

  const game = section.querySelector('.stopclock-game');
  const display = section.querySelector('.stopclock-display');
  const button = section.querySelector('.stopclock-button');
  const nextButton = section.querySelector('.stopclock-next');
  const feedback = section.querySelector('.stopclock-feedback');
  const progress = section.querySelector('.stopclock-progress');
  const result = section.querySelector('.stopclock-result');
  const resultScore = section.querySelector('.stopclock-result-score');
  const resultNote = section.querySelector('.stopclock-result-note');
  const againButton = section.querySelector('.stopclock-again');

  let roundIndex = 0;
  let score = 0;
  let errors = [];
  let state = 'idle';
  let startTime = 0;
  let stoppedAt = 0;
  let frame = 0;

  function renderProgress() {
    progress.textContent = `Ronda ${Math.min(roundIndex + 1, totalRounds)} / ${totalRounds} · ${score} puntos`;
  }

  function resetRound() {
    state = 'idle';
    display.textContent = '0.000';
    display.classList.remove('is-done');
    button.textContent = 'Empezar';
    button.hidden = false;
    nextButton.hidden = true;
    button.classList.remove('is-running');
    feedback.textContent = '';
    renderProgress();
  }

  function loop() {
    const elapsed = performance.now() - startTime;
    if (elapsed >= autoStop) {
      stop(autoStop);
      return;
    }
    display.textContent = format(elapsed);
    frame = window.requestAnimationFrame(loop);
  }

  function stop(rawElapsed) {
    const elapsed = Math.round(rawElapsed);
    window.cancelAnimationFrame(frame);
    state = 'stopped';
    display.textContent = format(elapsed);
    display.classList.add('is-done');
    const error = Math.abs(elapsed - target);
    const points = roundPoints(error);
    score += points;
    errors.push(error);
    const diff = elapsed - target;
    const sign = diff > 0 ? '+' : diff < 0 ? '\u2212' : '';
    const prefix = error === 0 ? '🌟 ¡EXACTO! ¡5,000 s! ' : error <= nearWindow ? '✨ ¡Casi perfecto! ¡Bonificación! ' : '';
    feedback.textContent = error === 0
      ? `${prefix}+${points} puntos`
      : `${prefix}Diferencia: ${sign}${format(error)} s. +${points} puntos`;
    if (error === 0) window.launchConfetti?.();
    button.classList.remove('is-running');
    button.hidden = true;
    stoppedAt = Date.now();
    nextButton.textContent = roundIndex + 1 >= totalRounds ? 'Ver resultado' : 'Siguiente';
    window.setTimeout(() => {
      nextButton.hidden = false;
      nextButton.focus();
    }, 450);
    progress.textContent = `Ronda ${roundIndex + 1} / ${totalRounds} · ${score} puntos`;
  }

  function finish() {
    game.hidden = true;
    const best = Math.min(...errors);
    resultScore.textContent = score;
    resultNote.textContent = `Puntos · menor diferencia: ${format(best)} s`;
    result.hidden = false;
    if (score >= totalRounds * maxRoundScore * 0.8) window.launchConfetti?.();
    againButton.focus();
  }

  function startGame() {
    roundIndex = 0;
    score = 0;
    errors = [];
    game.hidden = false;
    result.hidden = true;
    resetRound();
  }

  function toggleClock() {
    if (state === 'idle') {
      state = 'running';
      startTime = performance.now();
      button.textContent = '¡ALTO!';
      button.classList.add('is-running');
      frame = window.requestAnimationFrame(loop);
    } else if (state === 'running') {
      stop(performance.now() - startTime);
    }
  }

  // Pointer events react on press for accurate timing; click only covers keyboard activation.
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    toggleClock();
  });
  button.addEventListener('click', event => {
    if (event.detail === 0) toggleClock();
  });

  nextButton.addEventListener('click', () => {
    if (Date.now() - stoppedAt < 500) return;
    roundIndex += 1;
    if (roundIndex >= totalRounds) finish();
    else resetRound();
  });

  againButton.addEventListener('click', startGame);
  startGame();
}
