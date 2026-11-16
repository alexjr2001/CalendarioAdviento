export default function mountPuzzle(container, calendarConfig) {
  const section = document.createElement('section');
  section.className = 'puzzle-section activity-section';
  section.innerHTML = '<h2>Arma el rompecabezas</h2><p class="puzzle-hint">Toca dos piezas para intercambiarlas</p><div class="puzzle-board"></div><div class="puzzle-footer"><p class="puzzle-status" aria-live="polite"></p><button class="puzzle-reset" type="button">Mezclar de nuevo</button></div>';
  container.appendChild(section);

  const size = 3;
  const total = size * size;
  const imageSource = calendarConfig.puzzleImage || '/shared/imgs/memoria/gift.png';
  const board = section.querySelector('.puzzle-board');
  const statusNode = section.querySelector('.puzzle-status');
  const resetButton = section.querySelector('.puzzle-reset');
  board.style.setProperty('--puzzle-size', size);

  function shuffledOrder() {
    const order = Array.from({ length: total }, (_, index) => index);
    do {
      for (let index = order.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
      }
    } while (order.every((value, index) => value === index));
    return order;
  }

  let selectedTile = null;

  function renderTile(tile, homeIndex) {
    const row = Math.floor(homeIndex / size);
    const column = homeIndex % size;
    tile.style.backgroundImage = `url("${imageSource}")`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition = `${(column * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`;
    tile.dataset.home = homeIndex;
  }

  function checkSolved() {
    const tiles = [...board.children];
    const solved = tiles.every((tile, index) => Number(tile.dataset.home) === index);
    board.classList.toggle('solved', solved);
    statusNode.textContent = solved ? '¡Resuelto! Muy bien.' : '';
    if (solved) {
      tiles.forEach(tile => { tile.disabled = true; });
      window.launchConfetti?.();
    }
  }

  function buildBoard() {
    selectedTile = null;
    board.classList.remove('solved');
    statusNode.textContent = '';
    board.replaceChildren();
    shuffledOrder().forEach(homeIndex => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'puzzle-tile';
      tile.setAttribute('aria-label', `Puzzle-Teil ${homeIndex + 1}`);
      renderTile(tile, homeIndex);
      tile.addEventListener('click', () => {
        if (!selectedTile) {
          selectedTile = tile;
          tile.classList.add('selected');
          return;
        }
        if (selectedTile === tile) {
          tile.classList.remove('selected');
          selectedTile = null;
          return;
        }
        const firstHome = Number(selectedTile.dataset.home);
        const secondHome = Number(tile.dataset.home);
        renderTile(selectedTile, secondHome);
        renderTile(tile, firstHome);
        selectedTile.classList.remove('selected');
        selectedTile = null;
        checkSolved();
      });
      board.appendChild(tile);
    });
  }

  resetButton.addEventListener('click', buildBoard);
  buildBoard();
}