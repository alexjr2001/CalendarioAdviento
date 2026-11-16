const emojiRiddles = [
  { emoji: ['🎄'], answer: 'Arbol de Navidad', aliases: ['Arbol'], category: 'Palabra navideña' },
  { emoji: ['🎅', '🎁'], answer: 'Papa Noel', aliases: ['Santa Claus'], category: 'Palabra navideña' },
  { emoji: ['⛄', '🥕'], answer: 'Muneco de nieve', aliases: [], category: 'Palabra navideña' },
  { emoji: ['🦌', '🛷'], answer: 'Reno', aliases: ['Renos'], category: 'Palabra navideña' },
  { emoji: ['🕯️', '✨'], answer: 'Luz de vela', aliases: ['Vela', 'Velas'], category: 'Palabra navideña' },
  { emoji: ['🍪', '🌶️'], answer: 'Galleta de jengibre', aliases: ['Hombre de jengibre'], category: 'Palabra navideña' },
  { emoji: ['🔔', '🔔'], answer: 'Campanas', aliases: ['Campana'], category: 'Palabra navideña' },
  { emoji: ['🍬', '🎅'], answer: 'Baston de caramelo', aliases: ['Bastones de caramelo'], category: 'Palabra navideña' },
  { emoji: ['👦', '🏠', '🎄'], answer: 'Mi pobre angelito', aliases: ['Solo en casa', 'Home Alone'], category: 'Película' },
  { emoji: ['👨‍🎄', '🎁', '😠'], answer: 'El Grinch', aliases: ['Como el Grinch robo la Navidad', 'The Grinch'], category: 'Película' },
  { emoji: ['🧝', '🛷', '❄️'], answer: 'El expreso polar', aliases: ['Polar Express'], category: 'Película' },
  { emoji: ['👼', '🔔', '🎄'], answer: 'Que bello es vivir', aliases: ['Its a Wonderful Life'], category: 'Película' },
  { emoji: ['❄️', '👸', '⛄'], answer: 'Frozen', aliases: ['Una aventura congelada', 'La reina de las nieves'], category: 'Película' },
  { emoji: ['🧔', '🍽️', '🌲'], answer: 'Vacaciones de Navidad', aliases: ['National Lampoons Christmas Vacation'], category: 'Película' },
  { emoji: ['🎄', '🔔', '🔔'], answer: 'Navidad Navidad', aliases: ['Jingle Bells'], category: 'Canción' },
  { emoji: ['🤫', '🌙', '⭐'], answer: 'Noche de paz', aliases: ['Silent Night'], category: 'Canción' },
  { emoji: ['🛷', '🔔', '🎵'], answer: 'Rodolfo el reno', aliases: ['Rudolph the Red Nosed Reindeer'], category: 'Canción' },
  { emoji: ['🎅', '🚪', '🎶'], answer: 'Ya viene la vieja', aliases: ['Ya viene la vieja cargada de huevos'], category: 'Canción' },
  { emoji: ['🎁', '🎶', '💌'], answer: 'Todo lo que quiero en Navidad eres tu', aliases: ['All I Want for Christmas Is You'], category: 'Canción' },
  { emoji: ['❄️', '🚶', '🎵'], answer: 'Paseo en trineo', aliases: ['Sleigh Ride'], category: 'Canción' }
];

const roundSize = 6;
const scoring = [10, 7, 4, 1];

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function normalizeAnswer(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(?:el|la|los|las|un|una|unos|unas|the)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export default function mountEmojiRiddle(container) {
  const section = document.createElement('section');
  section.className = 'emoji-riddle-section activity-section';
  section.innerHTML = '<p class="emoji-riddle-eyebrow">Descifra la pista</p><h2>Acertijos con emojis</h2><p class="emoji-riddle-intro">Adivina la palabra, película o canción navideña a partir de los símbolos.</p><div class="emoji-riddle-card"><p class="emoji-riddle-category"></p><p class="emoji-riddle-icons" aria-label="Pista con emojis"></p><form class="emoji-riddle-form"><label class="emoji-riddle-field">Tu respuesta<input type="text" autocomplete="off" placeholder="Escribe tu respuesta" /></label><div class="emoji-riddle-actions"><button class="emoji-riddle-submit" type="submit">Comprobar</button><button class="emoji-riddle-solution" type="button">Mostrar respuesta</button></div><button class="emoji-riddle-next" type="button" hidden>Siguiente</button></form><p class="emoji-riddle-feedback" aria-live="polite"></p></div><div class="emoji-riddle-footer"><span class="emoji-riddle-progress"></span><button class="emoji-riddle-new" type="button">Nueva ronda</button></div>';
  container.appendChild(section);

  const category = section.querySelector('.emoji-riddle-category');
  const icons = section.querySelector('.emoji-riddle-icons');
  const form = section.querySelector('.emoji-riddle-form');
  const input = section.querySelector('.emoji-riddle-field input');
  const feedback = section.querySelector('.emoji-riddle-feedback');
  const progress = section.querySelector('.emoji-riddle-progress');
  const submitButton = section.querySelector('.emoji-riddle-submit');
  const solutionButton = section.querySelector('.emoji-riddle-solution');
  const nextButton = section.querySelector('.emoji-riddle-next');
  const newButton = section.querySelector('.emoji-riddle-new');
  let round = [];
  let currentIndex = 0;
  let score = 0;
  let attempts = 0;
  let solvedCurrent = false;

  function currentRiddle() {
    return round[currentIndex];
  }

  function startRound() {
    round = shuffle(emojiRiddles).slice(0, roundSize);
    currentIndex = 0;
    score = 0;
    renderRiddle();
  }

  function renderRiddle() {
    if (currentIndex >= round.length) {
      category.textContent = 'Ronda terminada';
      icons.textContent = '✨';
      feedback.textContent = `Resolviste ${score} de ${round.length} acertijos.`;
      progress.textContent = `${round.length} / ${round.length}`;
      input.disabled = true;
      submitButton.disabled = true;
      newButton.focus();
      if (score >= 4) window.launchConfetti?.();
      return;
    }

    const riddle = currentRiddle();
    attempts = 0;
    solvedCurrent = false;
    solutionButton.hidden = false;
    nextButton.hidden = true;
    category.textContent = `${riddle.category} · Acertijo ${currentIndex + 1} / ${round.length}`;
    icons.textContent = riddle.emoji.join(' ');
    feedback.textContent = '';
    progress.textContent = `${currentIndex} / ${round.length}`;
    input.value = '';
    input.disabled = false;
    submitButton.disabled = false;
    input.focus();
  }

  function revealSolution() {
    if (solvedCurrent || currentIndex >= round.length) return;
    solvedCurrent = true;
    feedback.textContent = `Respuesta: ${currentRiddle().answer}.`;
    progress.textContent = `${currentIndex + 1} / ${round.length}`;
    input.disabled = true;
    submitButton.disabled = true;
    solutionButton.hidden = true;
    nextButton.hidden = false;
    nextButton.focus();
  }

  function goToNextRiddle() {
    currentIndex += 1;
    renderRiddle();
  }

  function checkAnswer() {
    if (solvedCurrent) return;
    const normalizedInput = normalizeAnswer(input.value);
    if (!normalizedInput) {
      feedback.textContent = 'Escribe primero tu respuesta.';
      input.focus();
      return;
    }

    const accepted = [currentRiddle().answer, ...currentRiddle().aliases].map(normalizeAnswer);
    if (accepted.includes(normalizedInput)) {
      solvedCurrent = true;
      score += scoring[Math.min(attempts, scoring.length - 1)];
      feedback.textContent = '¡Exacto! Esa respuesta coincide con los emojis.';
      progress.textContent = `${currentIndex + 1} / ${round.length}`;
      window.setTimeout(() => {
        currentIndex += 1;
        renderRiddle();
      }, 900);
      return;
    }

    attempts += 1;
    if (attempts < 3) {
      feedback.textContent = attempts === 1 ? 'Aún no. Observa los símbolos con atención.' : 'Casi. Piensa en el contexto: Navidad, película o canción.';
    } else {
      solvedCurrent = true;
      feedback.textContent = `La respuesta era: ${currentRiddle().answer}.`;
      progress.textContent = `${currentIndex + 1} / ${round.length}`;
      window.setTimeout(() => {
        currentIndex += 1;
        renderRiddle();
      }, 1200);
    }
  }

  solutionButton.addEventListener('click', revealSolution);
  nextButton.addEventListener('click', goToNextRiddle);
  form.addEventListener('submit', event => {
    event.preventDefault();
    checkAnswer();
  });

  newButton.addEventListener('click', startRound);
  startRound();
}
