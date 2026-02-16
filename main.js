import MainScene from './src/scenes/MainScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: true //enxergar colisoes
    }
  },
  scene: MainScene
};

new Phaser.Game(config);
