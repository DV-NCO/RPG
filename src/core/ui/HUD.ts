import Phaser from 'phaser';

import GameState from '../state/GameState';

export default class HUD extends Phaser.GameObjects.Container {
  private hpBar: Phaser.GameObjects.Graphics;

  private staminaBar: Phaser.GameObjects.Graphics;

  private debtBar: Phaser.GameObjects.Graphics;

  private fuelText: Phaser.GameObjects.Text;

  private hintText: Phaser.GameObjects.Text;

  private questText: Phaser.GameObjects.Text;

  private labels: Record<string, Phaser.GameObjects.Text>;

  private gameState: GameState;

  constructor(scene: Phaser.Scene, state: GameState) {
    super(scene, 8, 8);
    this.gameState = state;

    this.hpBar = scene.add.graphics();
    this.staminaBar = scene.add.graphics();
    this.debtBar = scene.add.graphics();
    this.fuelText = scene.add.text(0, 42, '', { fontFamily: 'monospace', fontSize: '8px', color: '#f4a259' });
    this.hintText = scene.add.text(0, 60, '', { fontFamily: 'monospace', fontSize: '8px', color: '#e0e1dd' });
    this.questText = scene.add.text(0, 76, '', { fontFamily: 'monospace', fontSize: '8px', color: '#7fcdbb' });
    this.labels = {
      hp: scene.add.text(4, -2, 'HP', { fontFamily: 'monospace', fontSize: '6px', color: '#e0e1dd' }),
      stamina: scene.add.text(4, 12, 'Stamina', { fontFamily: 'monospace', fontSize: '6px', color: '#e0e1dd' }),
      debt: scene.add.text(4, 26, 'Shadow Debt', { fontFamily: 'monospace', fontSize: '6px', color: '#e0e1dd' }),
    };

    this.add([
      this.hpBar,
      this.staminaBar,
      this.debtBar,
      this.fuelText,
      this.hintText,
      this.questText,
      this.labels.hp,
      this.labels.stamina,
      this.labels.debt,
    ]);
    scene.add.existing(this);

    this.updateStats();
  }

  updateStats(): void {
    const stats = this.gameState.getSaveData().stats;
    this.drawBar(this.hpBar, 0, 0, stats.hp / 100, '#ef5d60');
    this.drawBar(this.staminaBar, 0, 14, stats.stamina / 100, '#5b8e7d');
    this.drawBar(this.debtBar, 0, 28, stats.debt / stats.debtCap, '#778da9');
    this.fuelText.setText(`Fuel: ${stats.lanternFuel.toFixed(0)}`);
  }

  setHint(message: string): void {
    this.hintText.setText(message);
  }

  setQuestTracker(lines: string[]): void {
    this.questText.setText(lines.join('\n'));
  }

  private drawBar(bar: Phaser.GameObjects.Graphics, x: number, y: number, ratio: number, color: string): void {
    const width = 140;
    const height = 10;
    bar.clear();
    bar.fillStyle(0x111111, 0.8);
    bar.fillRoundedRect(x, y, width, height, 2);
    bar.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    bar.fillRoundedRect(x + 1, y + 1, (width - 2) * Phaser.Math.Clamp(ratio, 0, 1), height - 2, 2);
    bar.lineStyle(1, 0xffffff, 0.4);
    bar.strokeRoundedRect(x, y, width, height, 2);
  }
}
