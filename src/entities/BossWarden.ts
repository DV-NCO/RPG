import Phaser from 'phaser';

import Enemy from './Enemy';

export default class BossWarden extends Enemy {
  private phaseTimer = 0;

  private lightPhase = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { texture: 'boss', speed: 40, damage: 14, hp: 300 });
    this.setScale(1.4);
  }

  togglePhase(): void {
    this.lightPhase = !this.lightPhase;
    this.phaseTimer = 5000;
  }

  updatePhase(delta: number): void {
    this.phaseTimer -= delta;
    if (this.phaseTimer <= 0) {
      this.togglePhase();
    }
  }

  isLightPhase(): boolean {
    return this.lightPhase;
  }

  protected override getSpeed(lightLevel: number): number {
    if (this.lightPhase) {
      return lightLevel > 0.4 ? 80 : 40;
    }
    return lightLevel < 0.5 ? 90 : 30;
  }
}
