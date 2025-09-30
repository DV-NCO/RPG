import Enemy from '../Enemy';

export default class Nightborn extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, { texture: 'nightborn', speed: 70, damage: 10, hp: 36 });
  }

  protected override getSpeed(lightLevel: number): number {
    const base = 70;
    return lightLevel < 0.4 ? base * 1.8 : base * 0.5;
  }
}
