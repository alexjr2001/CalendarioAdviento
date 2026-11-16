const candies = ['🍬', '🍭', '🍫', '🍪', '🎁', '🧁'];
const totalRounds = 5;
const maxRoundScore = 100;
const minCount = 12;
const maxCount = 90;

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function roundPoints(guess, actual) {
  const error = Math.abs(guess - actual) / actual;
  return Math.max(0, Math.round(maxRoundScore * (1 - error)));
}

export default function mountCandyCount(container) {
  const section = document.createElement('section');
  section.className = 'candy-count-section activity-section';
  section.innerHTML = '<p class="candy-count-eyebrow">Juego de estimación</p><h2>¿Cuántos dulces hay?</h2><p class="candy-count-intro">Calcula cuántos dulces hay en la canasta. Cuanto más te acerques, más puntos ganas.</p><div class="candy-count-result" aria-live="polite" hidden><p class="candy-count-result-title">¡Juego terminado!</p><p class="candy-count-result-score"></p><p class="candy-count-result-max"></p></div><div class="candy-count-basket" role="img" aria-label="Canasta llena de dulces"></div><form class="candy-count-form"><label class="candy-count-field">Tu estimación<input type="number" min="0" max="999" inputmode="numeric" autocomplete="off" placeholder="Cantidad" /></label><button class="candy-count-submit" type="submit">Adivinar</button><button class="candy-count-next" type="button" hidden>Siguiente</button></form><p class="candy-count-feedback" aria-live="polite"></p><div class="candy-count-footer"><span class="candy-count-progress"></span><button class="candy-count-new" type="button">Nueva ronda</button></div>';
  container.appendChild(section);

  const basket = section.querySelector('.candy-count-basket');
  const result = section.querySelector('.candy-count-result');
  const resultScore = section.querySelector('.candy-count-result-score');
  const resultMax = section.querySelector('.candy-count-result-max');
  const form = section.querySelector('.candy-count-form');
  const input = section.querySelector('.candy-count-field input');
  const submitButton = section.querySelector('.candy-count-submit');
  const nextButton = section.querySelector('.candy-count-next');
  const feedback = section.querySelector('.candy-count-feedback');
  const progress = section.querySelector('.candy-count-progress');
  const newButton = section.querySelector('.candy-count-new');
  let roundIndex = 0;
  let score = 0;
  let actual = 0;
  let answered = false;

  function fillBasket(count) {
    basket.replaceChildren();
    for (let index = 0; index < count; index += 1) {
      const item = document.createElement('span');
      item.className = 'candy-count-item';
      item.textContent = candies[randomInt(0, candies.length - 1)];
      item.style.left = `${randomInt(4, 88)}%`;
      item.style.top = `${randomInt(4, 84)}%`;
      item.style.transform = `rotate(${randomInt(-40, 40)}deg)`;
      basket.appendChild(item);
    }
  }

  function startGame() {
    roundIndex = 0;
    score = 0;
    startRound();
  }

  function startRound() {
    section.classList.remove('is-finished');
    result.hidden = true;
    actual = randomInt(minCount, maxCount);
    answered = false;
    fillBasket(actual);
    input.value = '';
    input.disabled = false;
    submitButton.disabled = false;
    submitButton.hidden = false;
    nextButton.hidden = true;
    feedback.textContent = '';
    progress.textContent = `Ronda ${roundIndex + 1} / ${totalRounds} · ${score} puntos`;
    input.focus();
  }

  function finish() {
    basket.replaceChildren();
    input.disabled = true;
    submitButton.disabled = true;
    nextButton.hidden = true;
    const maxScore = totalRounds * maxRoundScore;
    resultScore.textContent = score;
    resultMax.textContent = `de ${maxScore} puntos`;
    result.hidden = false;
    section.classList.add('is-finished');
    progress.textContent = `${totalRounds} / ${totalRounds} · ${score} puntos`;
    if (score >= maxScore * 0.6) window.launchConfetti?.();
    newButton.focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (answered) return;
    const guess = Number.parseInt(input.value, 10);
    if (!Number.isFinite(guess) || guess < 0) {
      feedback.textContent = 'Escribe primero un número.';
      input.focus();
      return;
    }
    answered = true;
    const points = roundPoints(guess, actual);
    score += points;
    feedback.textContent = guess === actual
      ? `¡Exacto! Había ${actual}. +${points} puntos`
      : `Había ${actual} dulces y calculaste ${guess}. +${points} puntos`;
    progress.textContent = `Ronda ${roundIndex + 1} / ${totalRounds} · ${score} puntos`;
    input.disabled = true;
    submitButton.hidden = true;
    nextButton.textContent = roundIndex + 1 >= totalRounds ? 'Ver resultado' : 'Siguiente';
    nextButton.hidden = false;
    nextButton.focus();
  });

  nextButton.addEventListener('click', () => {
    roundIndex += 1;
    if (roundIndex >= totalRounds) finish();
    else startRound();
  });

  newButton.addEventListener('click', startGame);
  startGame();
}
