import Phaser from 'phaser';

export interface EnemyConfig {
  texture: string;
  speed: number;
  damage: number;
  hp: number;
}

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected hp: number;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly config: EnemyConfig) {
    super(scene, x, y, config.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = config.hp;
    this.setOrigin(0.5, 0.5);
    this.setSize(8, 8);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  protected getSpeed(_lightLevel: number): number {
    return this.config.speed;
  }

  dealDamage(): number {
    return this.config.damage;
  }
}
