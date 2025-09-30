import Phaser from 'phaser';

import HUD from '../core/ui/HUD';
import PhaserGame from '../game/PhaserGame';

export default class UIScene extends Phaser.Scene {
  private hud!: HUD;

  private pauseText?: Phaser.GameObjects.Text;

  private paused = false;

  constructor() {
    super('UIScene');
  }

  create(): void {
    const game = this.game as PhaserGame;
    const state = game.state;
    this.hud = new HUD(this, state);

    this.game.events.on('hud:update', () => this.hud.updateStats());
    this.game.events.on('hud:hint', (message: string) => this.hud.setHint(message));
    this.game.events.on('hud:quests', (lines: string[]) => this.hud.setQuestTracker(lines));

    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
  }

  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) {
      this.scene.pause('OverworldScene');
      this.scene.pause('DungeonScene');
      this.scene.pause('BossScene');
      this.pauseText = this.add
        .text(160, 90, 'Paused\nTab: Inventory\nEsc: Resume', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5);
    } else {
      this.scene.resume('OverworldScene');
      this.scene.resume('DungeonScene');
      this.scene.resume('BossScene');
      this.pauseText?.destroy();
      this.pauseText = undefined;
    }
  }
}
