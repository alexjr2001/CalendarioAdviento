const words = [
  { word: 'Arbol de Navidad', hint: 'Lo decoramos con luces y adornos en diciembre.' },
  { word: 'Estrella navidena', hint: 'Brilla en la punta del arbol o en el cielo.' },
  { word: 'Galleta de jengibre', hint: 'Un dulce con especias que suele tener forma de persona.' },
  { word: 'Paseo en trineo', hint: 'Se disfruta deslizandose por la nieve.' },
  { word: 'Papa Noel', hint: 'Trae regalos durante la noche de Navidad.' },
  { word: 'Trineo', hint: 'Este vehiculo se desliza sobre la nieve.' },
  { word: 'Luz de vela', hint: 'Ilumina las noches frias de diciembre.' },
  { word: 'Reno', hint: 'Este animal tira del trineo de Papa Noel.' },
  { word: 'Calcetin', hint: 'Se cuelga para recibir pequenos regalos.' },
  { word: 'Canela', hint: 'Especia aromatica que se usa en dulces navidenos.' }
];
const maxMisses = 7;
const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

function normalizeLetter(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

export default function mountGalgenraten(container) {
  const section = document.createElement('section');
  section.className = 'galgenraten-section activity-section';
  section.innerHTML = '<p class="galgenraten-eyebrow">Una palabra navideña te espera</p><h2>Ahorcado</h2><p class="galgenraten-intro">Adivina la palabra letra por letra antes de que se dibuje la estrella navideña.</p><div class="galgenraten-main"><div class="galgenraten-figure" aria-hidden="true"><svg viewBox="0 0 140 180"><g class="galgenraten-stage"><path d="M31 169h78"/><path d="M58 169V20"/><path d="M58 20h54"/><path d="M112 20v23"/></g><g class="galgenraten-body"><circle class="part part-1" cx="112" cy="51" r="8"/><path class="part part-2" d="M112 59v39"/><path class="part part-3" d="M112 69l-14 17"/><path class="part part-4" d="M112 69l14 17"/><path class="part part-5" d="M112 98l-14 22"/><path class="part part-6" d="M112 98l14 22"/><path class="part part-7" d="M103 47l9-8 9 8-9 8z"/></g></svg></div><div class="galgenraten-puzzle"><p class="galgenraten-hint" hidden></p><div class="galgenraten-word" aria-label="Palabra actual"></div><p class="galgenraten-misses"></p><p class="galgenraten-status" aria-live="polite"></p><button class="galgenraten-hint-button" type="button">Mostrar pista</button><div class="galgenraten-letters" aria-label="Elegir letras"></div></div></div><button class="galgenraten-new" type="button">Nueva palabra</button>';
  container.appendChild(section);

  const figureParts = [...section.querySelectorAll('.galgenraten-body .part')];
  const hint = section.querySelector('.galgenraten-hint');
  const hintButton = section.querySelector('.galgenraten-hint-button');
  const wordBoard = section.querySelector('.galgenraten-word');
  const missesNode = section.querySelector('.galgenraten-misses');
  const status = section.querySelector('.galgenraten-status');
  const lettersNode = section.querySelector('.galgenraten-letters');
  let previousWord = null;
  let current = null;
  let guessed = new Set();
  let misses = 0;
  let gameOver = false;

  function normalizedLetters() {
    return [...current.word].map(character => character === ' ' ? ' ' : normalizeLetter(character));
  }

  function renderWord() {
    wordBoard.replaceChildren(...normalizedLetters().map(letter => {
      const tile = document.createElement('span');
      tile.className = `galgenraten-tile${letter === ' ' ? ' is-space' : ''}`;
      tile.textContent = letter === ' ' ? '' : guessed.has(letter) ? letter : '';
      tile.setAttribute('aria-label', letter === ' ' ? 'Espacio' : guessed.has(letter) ? `Letra ${letter}` : 'Letra sin adivinar');
      return tile;
    }));
  }

  function renderMisses() {
    missesNode.textContent = `Intentos fallidos: ${misses} / ${maxMisses}`;
    figureParts.forEach((part, index) => { part.style.opacity = index < misses ? '1' : '0'; });
  }

  function renderLetters() {
    lettersNode.replaceChildren(...alphabet.map(letter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'galgenraten-letter';
      button.textContent = letter;
      button.setAttribute('aria-label', `Probar la letra ${letter}`);
      button.disabled = gameOver || guessed.has(letter);
      if (guessed.has(letter)) button.classList.add('is-guessed');
      return button;
    }));
  }

  function endGame(message, won) {
    gameOver = true;
    status.textContent = message;
    section.classList.toggle('is-won', won);
    section.classList.toggle('is-lost', !won);
    if (won) window.launchConfetti?.();
    renderLetters();
  }

  function guess(letter) {
    if (gameOver || guessed.has(letter)) return;
    guessed.add(letter);
    if (normalizedLetters().includes(letter)) {
      status.textContent = '¡Bien! La letra está en la palabra.';
    } else {
      misses += 1;
      status.textContent = 'No es esa. Prueba con otra letra.';
    }

    renderWord();
    renderMisses();
    renderLetters();

    if (normalizedLetters().filter(item => item !== ' ').every(item => guessed.has(item))) {
      endGame(`¡Lo lograste!: ${current.word}.`, true);
      return;
    }
    if (misses >= maxMisses) {
      endGame(`La palabra era: ${current.word}.`, false);
    }
  }

  function startWord() {
    const choices = words.filter(item => item !== previousWord);
    current = choices[Math.floor(Math.random() * choices.length)];
    previousWord = current;
    guessed = new Set();
    misses = 0;
    gameOver = false;
    hint.hidden = true;
    hint.textContent = current.hint;
    hintButton.hidden = false;
    hintButton.textContent = 'Mostrar pista';
    section.classList.remove('is-won', 'is-lost');
    status.textContent = '';
    renderWord();
    renderMisses();
    renderLetters();
  }

  lettersNode.addEventListener('click', event => {
    const button = event.target.closest('.galgenraten-letter');
    if (button) guess(button.textContent);
  });

  section.addEventListener('keydown', event => {
    if (event.key.length !== 1) return;
    const letter = normalizeLetter(event.key);
    if (alphabet.includes(letter)) guess(letter);
  });

  hintButton.addEventListener('click', () => {
    hint.hidden = false;
    hintButton.hidden = true;
  });

  section.querySelector('.galgenraten-new').addEventListener('click', startWord);
  startWord();
}
