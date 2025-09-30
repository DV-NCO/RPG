import Enemy from '../Enemy';

export default class Lightborn extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { texture: 'lightborn', speed: 60, damage: 12, hp: 40 });
  }

  protected override getSpeed(lightLevel: number): number {
    const base = 60;
    return lightLevel > 0.5 ? base * 1.6 : base * 0.5;
  }
}
