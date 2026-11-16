export const calendarGames = [
  { id: 'puzzle', label: 'Rompecabezas', icon: '🧩', description: 'Arma la imagen pieza por pieza con una ilustración navideña o una foto tuya.', tags: ['👤 1 jugador', '🖼️ Foto propia'], imageUpload: true },
  { id: 'memory', label: 'Memorama', icon: '🃏', description: 'Encuentra todas las parejas de imágenes.', tags: ['👤 1 jugador'] },
  { id: 'wordsearch', label: 'Sopa de letras', icon: '🔎', description: 'Encuentra las palabras navideñas ocultas en la cuadrícula.', tags: ['👤 1 jugador'] },
  { id: 'spot-difference', label: 'Encuentra las diferencias', icon: '👀', description: 'Compara dos escenas navideñas y encuentra las cinco diferencias.', tags: ['👤 1 jugador'] },
  { id: 'christmas-quiz', label: 'Trivia navideña', icon: '💌', description: 'Responde preguntas sobre la Navidad.', tags: ['👤 1 jugador', '🧠 Conocimientos'] },
  { id: 'christmas-maze', label: 'El camino al árbol de Navidad', icon: '🌲', description: 'Encuentra el camino por el bosque invernal con tu compañero.', tags: ['👤 1 jugador'] },
  { id: 'letter-sorter', label: 'Ordena las palabras navideñas', icon: '🔤', description: 'Ordena las letras para formar la palabra correcta.', tags: ['👤 1 jugador'] },
  { id: 'emoji-riddle', label: 'Acertijos con emojis', icon: '🤔', description: 'Adivina palabras, películas y canciones navideñas usando emojis.', tags: ['👤 1 jugador', '🧠 Ingenio'] },
  { id: 'galgenraten', label: 'Adivina la palabra', icon: '⭐', description: 'Descubre la palabra, letra por letra.', tags: ['👤 1 jugador'] },
  { id: 'christmas-reflexes', label: 'Reflejos navideños', icon: '⚡', description: 'Toca los símbolos antes de que desaparezcan.', tags: ['👤 1 jugador', '⚡ Destreza'] },
  { id: 'sack-catch', label: 'Atrapa los regalos', icon: '🎅', description: 'Atrapa los regalos con el saco y esquiva el yunque.', tags: ['👤 1 jugador', '⚡ Destreza'] },
  { id: 'christmas-pacman', label: 'Pac-Man navideño', icon: '👾', description: 'Recoge todos los puntos luminosos antes de que te atrape el Grinch.', tags: ['👤 1 jugador', '⚡ Destreza'] },
  { id: 'candy-count', label: '¿Cuántos dulces hay?', icon: '🍬', description: 'Calcula cuántos dulces hay en la canasta. Cuanto más te acerques, más puntos ganas.', tags: ['👤 1 jugador', '🎯 5 rondas'] },
  { id: 'balance-gifts', label: 'Equilibra los regalos', icon: '⚖️', description: 'Distribuye los objetos para equilibrar la balanza.', tags: ['👤 1 jugador', '🧠 Ingenio'] },
  { id: 'reaction-duel', label: 'Duelo de reflejos', icon: '🔔', description: '¿Quién toca primero cuando suena la campana?', tags: ['👥 2 jugadores', '🤖 Contra la computadora', '📶 3 niveles'] },
  { id: 'christmas-tictactoe', label: 'Tres en raya navideño', icon: '🎄', description: 'Alinea tres símbolos para ganar.', tags: ['👥 2 jugadores', '🤖 Contra la computadora', '📶 2 niveles'] },
  { id: 'kniffel', label: 'Dados navideños', icon: '🎲', description: 'Tira los dados y suma puntos con distintas combinaciones.', tags: ['👥 1–4 jugadores', '🤖 Contra la computadora'] },
  { id: 'christmas-snake', label: 'Serpiente de caramelos', icon: '🐍', description: 'Recoge dulces y haz que la serpiente crezca.', tags: ['👤 1 jugador', '⚡ Destreza'] },
  { id: 'stop-clock', label: 'Detén el reloj', icon: '⏱️', description: 'Detén el cronómetro justo en los 5 segundos.', tags: ['👤 1 jugador', '🎯 5 rondas'] },
  { id: 'connect-four', label: 'Conecta cuatro', icon: '🔴', description: 'Conecta cuatro fichas en una línea.', tags: ['👥 2 jugadores', '🤖 Contra la computadora'] },
  { id: 'dots-and-boxes', label: 'Puntos y cuadrados', icon: '🔲', description: 'Traza líneas y cierra cuadrados. Gana quien consiga más.', tags: ['👥 2 jugadores', '🤖 Contra la computadora'] },
  { id: 'cup-shuffle', label: '¿Dónde está el regalo?', icon: '🥤', description: 'Sigue el vaso que esconde el regalo.', tags: ['👤 1 jugador', '📶 3 niveles'] },
  { id: 'pattern-game', label: 'Completa el patrón', icon: '🧠', description: 'Descubre la regla del patrón. ¡Solo tienes un intento por reto!', tags: ['👤 1 jugador', '🧠 Ingenio'] },
  { id: 'christmas-runner', label: 'Carrera de renos', icon: '🦌', description: 'Salta los obstáculos y agáchate para pasar por debajo de las palomas.', tags: ['👤 1 jugador', '⚡ Destreza'] },
  { id: 'christmas-crossword', label: 'Crucigrama navideño', icon: '📝', description: 'Resuelve el crucigrama con palabras navideñas.', tags: ['👤 1 jugador', '🧠 Ingenio'] }
];

export function isCalendarGame(id) {
  return calendarGames.some(game => game.id === id);
}