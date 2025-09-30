import Phaser from 'phaser';

import PhaserGame from '../game/PhaserGame';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.text(width / 2, height / 2 - 30, 'Shadow Pact', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#e0e4f8',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, 'Press Space or Gamepad A to Begin', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#a4b8ff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 40, 'Retro Action RPG Vertical Slice', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#7fcdbb',
    }).setOrigin(0.5);

    const key = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    key?.on('down', () => this.startGame());

    this.input.gamepad?.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      pad.on('down', (button: Phaser.Input.Gamepad.Button) => {
        if (button.index === 0) {
          this.startGame();
        }
      });
    });

    this.time.delayedCall(400, () => {
      this.sound.play('loop', { loop: true, volume: 0.1 });
    });
  }

  private startGame(): void {
    const game = this.game as PhaserGame;
    game.state.newGame();
    game.state.save();
    this.scene.start('OverworldScene', { entry: 'town' });
  }
}
