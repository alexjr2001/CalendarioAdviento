const words = [
  { word: 'ARBOL', hint: 'Lo decoramos con luces y adornos en Navidad.' },
  { word: 'REGALO', hint: 'Se envuelve con cuidado y se coloca bajo el árbol.' },
  { word: 'NIEVE', hint: 'Cubre el paisaje y cae en los días fríos.' },
  { word: 'GALLETAS', hint: 'Se hornean para compartir durante las fiestas.' },
  { word: 'RENO', hint: 'Este animal acompaña a Papá Noel en su trineo.' },
  { word: 'ANGEL', hint: 'Esta figura suele colocarse en la punta del árbol.' },
  { word: 'VELA', hint: 'Su llama ilumina las noches de diciembre.' },
  { word: 'ESTRELLA', hint: 'Brilla en el cielo y también adorna el árbol.' }
];

function shuffleLetters(word) {
  const letters = [...word];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const shuffled = [...letters];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
    }
    if (shuffled.join('') !== word) return shuffled;
  }
  return letters.reverse();
}

export default function mountLetterSorter(container) {
  const section = document.createElement('section');
  section.className = 'letter-sorter-section activity-section';
  section.innerHTML = '<p class="letter-sorter-eyebrow">Un saludo invernal</p><h2>Ordena las letras</h2><p class="letter-sorter-intro">Arrastra las tarjetas para poner las letras en orden y formar la palabra navideña.</p><p class="letter-sorter-hint"></p><div class="letter-sorter-word" aria-label="Palabra actual"></div><div class="letter-sorter-actions"><button class="letter-sorter-solution" type="button">Mostrar respuesta</button><button class="letter-sorter-new" type="button">Siguiente palabra</button></div><p class="letter-sorter-status" aria-live="polite"></p>';
  container.appendChild(section);

  const hint = section.querySelector('.letter-sorter-hint');
  const wordBoard = section.querySelector('.letter-sorter-word');
  const status = section.querySelector('.letter-sorter-status');
  const solutionButton = section.querySelector('.letter-sorter-solution');
  const nextButton = section.querySelector('.letter-sorter-new');
  let previousWord = null;
  let currentWord = null;
  let letters = [];
  let selectedIndex = null;
  let draggedIndex = null;

  function currentText() {
    return letters.map(letter => letter.text).join('');
  }

  function setStatus(message = 'Toca dos letras o arrastra una tarjeta hasta su lugar.') {
    status.textContent = message;
  }

  function render() {
    wordBoard.replaceChildren();
    letters.forEach((letter, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `letter-sorter-letter${selectedIndex === index ? ' is-selected' : ''}`;
      button.draggable = true;
      button.dataset.index = index;
      button.textContent = letter.text;
      button.setAttribute('aria-label', `Letra ${letter.text} en la posición ${index + 1}`);
      button.setAttribute('aria-pressed', selectedIndex === index);
      wordBoard.appendChild(button);
    });
  }

  function completeWord(message = `${currentWord.word} es la palabra. ¡Muy bien!`) {
    if (currentText() !== currentWord.word) return false;
    section.classList.add('is-complete');
    setStatus(message);
    selectedIndex = null;
    draggedIndex = null;
    render();
    wordBoard.querySelectorAll('.letter-sorter-letter').forEach(button => { button.disabled = true; });
    window.launchConfetti?.();
    return true;
  }

  function showSolution() {
    if (!currentWord) return;
    letters = [...currentWord.word].map(text => ({ text }));
    completeWord(`Respuesta: ${currentWord.word}.`);
  }

  function moveLetter(from, to) {
    if (from === to || from < 0 || to < 0 || from >= letters.length || to >= letters.length) return;
    const moved = letters.splice(from, 1)[0];
    letters.splice(to, 0, moved);
    selectedIndex = null;
    draggedIndex = null;
    section.classList.remove('is-complete');
    render();
    if (!completeWord()) setStatus();
  }

  function startWord() {
    const options = words.filter(item => item !== previousWord);
    currentWord = options[Math.floor(Math.random() * options.length)];
    previousWord = currentWord;
    letters = shuffleLetters(currentWord.word).map(text => ({ text }));
    selectedIndex = null;
    draggedIndex = null;
    hint.textContent = currentWord.hint;
    section.classList.remove('is-complete');
    setStatus();
    render();
  }

  wordBoard.addEventListener('click', event => {
    const button = event.target.closest('.letter-sorter-letter');
    if (!button || section.classList.contains('is-complete')) return;
    const index = Number(button.dataset.index);
    if (selectedIndex === null) {
      selectedIndex = index;
      button.classList.add('is-selected');
      button.setAttribute('aria-pressed', 'true');
      setStatus('Ahora toca la posición donde debe ir la letra.');
      return;
    }
    moveLetter(selectedIndex, index);
  });

  wordBoard.addEventListener('dragstart', event => {
    const button = event.target.closest('.letter-sorter-letter');
    if (!button) return;
    draggedIndex = Number(button.dataset.index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(draggedIndex));
  });

  wordBoard.addEventListener('dragover', event => {
    if (draggedIndex === null) return;
    event.preventDefault();
    const button = event.target.closest('.letter-sorter-letter');
    wordBoard.querySelectorAll('.letter-sorter-letter').forEach(tile => tile.classList.toggle('is-drop-target', tile === button));
  });

  wordBoard.addEventListener('drop', event => {
    const button = event.target.closest('.letter-sorter-letter');
    if (!button || draggedIndex === null) return;
    event.preventDefault();
    moveLetter(draggedIndex, Number(button.dataset.index));
  });

  wordBoard.addEventListener('dragleave', event => {
    if (!wordBoard.contains(event.relatedTarget)) {
      wordBoard.querySelectorAll('.letter-sorter-letter').forEach(tile => tile.classList.remove('is-drop-target'));
    }
  });

  wordBoard.addEventListener('dragend', () => {
    draggedIndex = null;
    wordBoard.querySelectorAll('.letter-sorter-letter').forEach(tile => tile.classList.remove('is-drop-target'));
  });

  solutionButton.addEventListener('click', showSolution);
  nextButton.addEventListener('click', startWord);
  startWord();
}
