const memoryCards = [
  { name: 'Árbol de Navidad', image: 'arbol.png' },
  { name: 'Esfera navideña', image: 'bola.png' },
  { name: 'Campanas', image: 'campanas.png' },
  { name: 'Casa', image: 'casa.png' },
  { name: 'Copo de nieve', image: 'copo.png' },
  { name: 'Dulce', image: 'dulce.png' },
  { name: 'Regalo', image: 'gift.png' },
  { name: 'Velas', image: 'velas.png' }
];

export default function mountMemory(container) {
  const section = document.createElement('section');
  section.className = 'memory-game-section activity-section';
  section.innerHTML = '<h2>Memorama navideño</h2><p class="memory-game-hint">Encuentra todas las parejas de imágenes.</p><div class="memory-game-board"></div><div class="memory-game-footer"><p class="memory-game-status" aria-live="polite"></p><button class="memory-game-reset" type="button">Empezar de nuevo</button></div>';
  container.appendChild(section);

  const board = section.querySelector('.memory-game-board');
  const statusNode = section.querySelector('.memory-game-status');
  const resetButton = section.querySelector('.memory-game-reset');
  let mismatchTimer = null;
  let flippedCards = [];
  let moves = 0;
  let matches = 0;
  let locked = false;
  let startedAt = 0;

  function renderStatus(message = '') {
    statusNode.textContent = message || `Movimientos: ${moves} · Parejas: ${matches}/${memoryCards.length}`;
  }

  function resetGame() {
    window.clearTimeout(mismatchTimer);
    flippedCards = [];
    moves = 0;
    matches = 0;
    locked = false;
    startedAt = 0;
    board.replaceChildren();
    const cards = memoryCards.flatMap((card, pair) => [{ ...card, pair }, { ...card, pair }]);
    cards.sort(() => Math.random() - .5);

    cards.forEach(cardData => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-game-card';
      card.setAttribute('aria-label', 'Voltear tarjeta');
      card.setAttribute('aria-pressed', 'false');
      card.innerHTML = `<span class="memory-game-card-inner"><span class="memory-game-face memory-game-card-back" aria-hidden="true">✦</span><span class="memory-game-face memory-game-card-front"><img src="/shared/imgs/memoria/${cardData.image}" alt="" /></span></span>`;
      card.addEventListener('click', () => {
        if (locked || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
        if (!startedAt) startedAt = Date.now();
        card.classList.add('is-flipped');
        card.setAttribute('aria-label', cardData.name);
        card.setAttribute('aria-pressed', 'true');
        flippedCards.push({ element: card, pair: cardData.pair });
        if (flippedCards.length < 2) return;

        moves += 1;
        const [firstCard, secondCard] = flippedCards;
        if (firstCard.pair === secondCard.pair) {
          firstCard.element.classList.add('is-matched');
          secondCard.element.classList.add('is-matched');
          firstCard.element.disabled = true;
          secondCard.element.disabled = true;
          flippedCards = [];
          matches += 1;
          renderStatus(matches === memoryCards.length ? '¡Felicidades! Encontraste todas las parejas.' : 'Encontraste una pareja.');
          if (matches === memoryCards.length) {
            const totalSeconds = Math.round((Date.now() - startedAt) / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            renderStatus(`🎉 ¡Lo lograste! ${moves} movimientos en ${minutes}:${seconds} min.`);
            window.launchConfetti?.();
            return;
          }
          renderStatus();
          return;
        }

        locked = true;
        renderStatus('No forman pareja. Inténtalo de nuevo.');
        mismatchTimer = window.setTimeout(() => {
          firstCard.element.classList.remove('is-flipped');
          secondCard.element.classList.remove('is-flipped');
          firstCard.element.setAttribute('aria-label', 'Voltear tarjeta');
          secondCard.element.setAttribute('aria-label', 'Voltear tarjeta');
          firstCard.element.setAttribute('aria-pressed', 'false');
          secondCard.element.setAttribute('aria-pressed', 'false');
          flippedCards = [];
          locked = false;
          renderStatus();
        }, 800);
      });
      board.appendChild(card);
    });
    renderStatus();
  }

  resetButton.addEventListener('click', resetGame);
  resetGame();
}