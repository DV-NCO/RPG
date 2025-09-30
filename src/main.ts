import PhaserGame from './game/PhaserGame';

const container = document.getElementById('game-container');

if (!container) {
  throw new Error('Missing game container');
}

const game = new PhaserGame(container);

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
