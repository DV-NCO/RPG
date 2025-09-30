import Phaser from 'phaser';

interface LightSource {
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

export default class LightSystem {
  private sources: LightSource[] = [];

  private lantern?: LightSource;

  private enabled = true;

  constructor() {}

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  loadStaticSources(sources: LightSource[]): void {
    this.sources = [...sources];
  }

  setLanternPosition(x: number, y: number, radius: number, intensity: number): void {
    this.lantern = { x, y, radius, intensity };
  }

  getLightLevel(x: number, y: number): number {
    if (!this.enabled) {
      return 0;
    }
    const allSources = [...this.sources];
    if (this.lantern) {
      allSources.push(this.lantern);
    }
    let level = 0;
    allSources.forEach((source) => {
      const distance = Phaser.Math.Distance.Between(x, y, source.x, source.y);
      if (distance < source.radius) {
        const contribution = Phaser.Math.Linear(source.intensity, 0, distance / source.radius);
        level = Math.max(level, contribution);
      }
    });
    return Phaser.Math.Clamp(level, 0, 1);
  }

  updateLanternCone(graphics: Phaser.GameObjects.Graphics, owner: Phaser.GameObjects.Sprite, angle: number): void {
    graphics.clear();
    if (!this.lantern) {
      return;
    }
    graphics.fillStyle(0xf4a259, 0.2);
    const radius = this.lantern.radius;
    const originX = owner.x;
    const originY = owner.y;
    const spread = Phaser.Math.DegToRad(45);
    const startAngle = angle - spread / 2;
    const endAngle = angle + spread / 2;
    graphics.slice(originX, originY, radius, startAngle, endAngle, false);
    graphics.fillPath();
  }
}
