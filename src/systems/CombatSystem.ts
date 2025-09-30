import Phaser from 'phaser';

import Enemy from '../entities/Enemy';
import Player from '../entities/Player';
import Shadow from '../entities/Shadow';

export interface CombatEventMap {
  enemyDefeated: [Enemy];
  playerDamaged: [number];
  shadowDamaged: [number];
}

export default class CombatSystem extends Phaser.Events.EventEmitter {
  private enemies: Set<Enemy> = new Set();

  constructor(private readonly scene: Phaser.Scene) {
    super();
  }

  registerEnemy(enemy: Enemy): void {
    this.enemies.add(enemy);
    enemy.once(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.enemies.has(enemy)) {
        this.enemies.delete(enemy);
        this.emit('enemyDefeated', enemy);
      }
    });
  }

  clear(): void {
    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies.clear();
  }

  handleAttack(hitbox: Phaser.Geom.Rectangle, damage: number): void {
    this.enemies.forEach((enemy) => {
      if (Phaser.Geom.Rectangle.Overlaps(hitbox, enemy.getBounds())) {
        enemy.takeDamage(damage);
      }
    });
  }

  watchPlayerCollisions(player: Player): void {
    this.scene.physics.add.overlap(player, Array.from(this.enemies), () => {
      this.emit('playerDamaged', 10);
    });
  }

  watchShadowCollisions(shadow: Shadow): void {
    this.scene.physics.add.overlap(shadow, Array.from(this.enemies), () => {
      this.emit('shadowDamaged', 8);
    });
  }

  getEnemyTarget(): Phaser.Math.Vector2 | null {
    const enemy = this.enemies.values().next().value as Enemy | undefined;
    if (!enemy) {
      return null;
    }
    return new Phaser.Math.Vector2(enemy.x, enemy.y);
  }
}
