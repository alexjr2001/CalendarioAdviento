# Adding Door Games

Each door game has one catalog entry and one public module.

1. Add `{ id: 'new-game', label: 'Nuevo juego', icon: '🎮', description: 'Una frase breve en español.', tags: ['👤 1 jugador'] }` to `lib/game-catalog.js`. The ID must be lowercase letters, numbers, or hyphens and match the module filename. Add `imageUpload: true` only when the editor should offer the shared puzzle-image upload control for that game.
2. Create `public/shared/games/new-game.js` and default-export a function that receives `(container, calendarConfig)`. The function should build its UI inside `container` and attach the game's event handlers.

The editor menu, assignment API validation, and public module loader use the catalog and ID convention automatically. No database migration or edits to the three design pages are needed.