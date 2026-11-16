const catalog = [
  { emoji: '🎄', name: 'Árbol de Navidad', weight: 8 },
  { emoji: '🎅', name: 'Papá Noel', weight: 7 },
  { emoji: '⛄', name: 'Muñeco de nieve', weight: 6 },
  { emoji: '🦌', name: 'Reno', weight: 5 },
  { emoji: '🎁', name: 'Regalo', weight: 4 },
  { emoji: '🧸', name: 'Oso de peluche', weight: 4 },
  { emoji: '🧦', name: 'Calcetín', weight: 3 },
  { emoji: '🍪', name: 'Galleta', weight: 2 },
  { emoji: '🔔', name: 'Campana', weight: 2 },
  { emoji: '🍬', name: 'Caramelo', weight: 1 },
  { emoji: '⭐', name: 'Estrella', weight: 1 }
];

const levelSizes = [4, 5, 6];
const maxTilt = 14;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function hasEqualSplit(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total % 2) return false;
  for (let mask = 1; mask < (1 << items.length) - 1; mask += 1) {
    let sum = 0;
    for (let bit = 0; bit < items.length; bit += 1) if (mask & (1 << bit)) sum += items[bit].weight;
    if (sum === total / 2) return true;
  }
  return false;
}

// Each emoji appears once, so the two pans can never hold identical objects.
function createLevel(size) {
  let items;
  do items = shuffle(catalog).slice(0, size);
  while (!hasEqualSplit(items));
  return items.map(item => ({ ...item, side: Math.random() < 0.5 ? 'left' : 'right' }));
}

export default function mountBalanceGifts(container) {
  const section = document.createElement('section');
  section.className = 'balance-gifts-section activity-section';
  section.innerHTML = '<p class="balance-gifts-eyebrow">Reto de ingenio</p><h2>Equilibra los regalos</h2><p class="balance-gifts-intro">Toca un objeto para pasarlo al otro lado. Cada uno tiene un peso distinto: ¡equilibra la balanza!</p><div class="balance-gifts-scale"><div class="balance-gifts-stand"></div><div class="balance-gifts-base"></div><div class="balance-gifts-beam"><div class="balance-gifts-bar"></div><div class="balance-gifts-hanger" data-hanger="left"><div class="balance-gifts-pan" data-side="left"></div><div class="balance-gifts-total"></div></div><div class="balance-gifts-hanger" data-hanger="right"><div class="balance-gifts-pan" data-side="right"></div><div class="balance-gifts-total"></div></div><div class="balance-gifts-pivot"></div></div></div><p class="balance-gifts-feedback" aria-live="polite"></p><button class="balance-gifts-next" type="button" hidden>Siguiente</button><div class="balance-gifts-footer"><span class="balance-gifts-progress"></span><button class="balance-gifts-new" type="button">Nueva ronda</button></div>';
  container.appendChild(section);

  const beam = section.querySelector('.balance-gifts-beam');
  const pans = {
    left: section.querySelector('[data-side="left"]'),
    right: section.querySelector('[data-side="right"]')
  };
  const hangers = section.querySelectorAll('.balance-gifts-hanger');
  const feedback = section.querySelector('.balance-gifts-feedback');
  const nextButton = section.querySelector('.balance-gifts-next');
  const progress = section.querySelector('.balance-gifts-progress');
  const newButton = section.querySelector('.balance-gifts-new');
  let levelIndex = 0;
  let items = [];
  let moves = 0;
  let solved = false;

  function sideWeight(side) {
    return items.filter(item => item.side === side).reduce((sum, item) => sum + item.weight, 0);
  }

  function render() {
    const left = sideWeight('left');
    const right = sideWeight('right');
    const diff = right - left;
    const total = left + right;
    const tilt = total ? Math.max(-maxTilt, Math.min(maxTilt, (diff / total) * 40)) : 0;
    beam.style.transform = `rotate(${tilt}deg)`;
    hangers.forEach(hanger => { hanger.style.setProperty('--tilt', `${-tilt}deg`); });
    hangers[0].querySelector('.balance-gifts-total').textContent = `${left} kg`;
    hangers[1].querySelector('.balance-gifts-total').textContent = `${right} kg`;

    for (const side of ['left', 'right']) {
      pans[side].replaceChildren();
      for (const item of items.filter(entry => entry.side === side)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'balance-gifts-item';
        button.disabled = solved;
        button.setAttribute('aria-label', `${item.name}. Pasar al otro lado`);
        button.innerHTML = `<span class="balance-gifts-emoji">${item.emoji}</span>`;
        button.addEventListener('click', () => {
          item.side = side === 'left' ? 'right' : 'left';
          moves += 1;
          if (moves === 1) section.querySelector('.balance-gifts-scale').scrollIntoView({ behavior: 'smooth', block: 'center' });
          check();
        });
        pans[side].appendChild(button);
      }
    }
  }

  function check() {
    const left = sideWeight('left');
    const right = sideWeight('right');
    const bothUsed = items.some(item => item.side === 'left') && items.some(item => item.side === 'right');
    solved = bothUsed && left === right;
    render();
    if (!solved) {
      feedback.textContent = left === right ? '' : `${left > right ? 'El lado izquierdo' : 'El lado derecho'} pesa más.`;
      return;
    }
    feedback.textContent = `¡Está equilibrada! Lo lograste en ${moves} ${moves === 1 ? 'movimiento' : 'movimientos'}.`;
    nextButton.textContent = levelIndex + 1 >= levelSizes.length ? 'Terminar' : 'Siguiente nivel';
    nextButton.hidden = false;
    nextButton.focus();
  }

  function startLevel() {
    do items = createLevel(levelSizes[levelIndex]);
    while (sideWeight('left') === sideWeight('right'));
    moves = 0;
    solved = false;
    nextButton.hidden = true;
    feedback.textContent = '';
    progress.textContent = `Nivel ${levelIndex + 1} / ${levelSizes.length}`;
    render();
  }

  function startGame() {
    levelIndex = 0;
    startLevel();
  }

  nextButton.addEventListener('click', () => {
    levelIndex += 1;
    if (levelIndex >= levelSizes.length) {
      nextButton.hidden = true;
      feedback.textContent = '¡Superaste todos los niveles! Tienes un gran sentido del equilibrio.';
      progress.textContent = `${levelSizes.length} / ${levelSizes.length}`;
      window.launchConfetti?.();
      newButton.focus();
    } else {
      startLevel();
    }
  });

  newButton.addEventListener('click', startGame);
  startGame();
}
