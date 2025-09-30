import Phaser from 'phaser';

import { InputSnapshot } from '../core/input/InputManager';
import GameState from '../core/state/GameState';

export interface ShadowContext {
  state: GameState;
  lightLevel: number;
  delta: number;
  onAttack: (hitbox: Phaser.Geom.Rectangle, damage: number) => void;
  onPhase: (position: Phaser.Math.Vector2) => void;
}

export default class Shadow extends Phaser.Physics.Arcade.Sprite {
  private attackTimer = 0;

  private swapCooldown = 0;

  private controlled = false;

  private health = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shadow');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setSize(8, 8);
    this.play('shadow-idle');
  }

  setControlled(value: boolean): void {
    this.controlled = value;
  }

  applyLightDamage(delta: number, lightLevel: number, state: GameState): void {
    if (lightLevel > 0.7) {
      this.health = Math.max(0, this.health - (delta * lightLevel) / 20);
      const stats = state.getSaveData().stats;
      state.updateStat('hp', Math.max(0, stats.hp - (delta * lightLevel) / 30));
    }
  }

  canSwap(): boolean {
    return this.swapCooldown <= 0;
  }

  markSwapped(): void {
    this.swapCooldown = 1000;
  }

  updateFromInput(snapshot: InputSnapshot, context: ShadowContext): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setDrag(400, 400);
    const dt = context.delta;

    if (!this.controlled) {
      body.setVelocity(0, 0);
      if (this.swapCooldown > 0) {
        this.swapCooldown -= dt;
      }
      return;
    }

    const inDarkness = context.lightLevel < 0.45;
    if (!inDarkness) {
      body.setVelocity(0, 0);
    } else {
      const moveX = (snapshot.left ? -1 : 0) + (snapshot.right ? 1 : 0);
      const moveY = (snapshot.up ? -1 : 0) + (snapshot.down ? 1 : 0);
      const speed = 90;
      body.setVelocity(moveX * speed, moveY * speed);
    }

    if (snapshot.attack && this.attackTimer <= 0 && inDarkness) {
      const reach = 16;
      const hitbox = new Phaser.Geom.Rectangle(this.x - reach / 2, this.y - reach / 2, reach, reach);
      context.onAttack(hitbox, 14);
      this.attackTimer = 220;
    }

    if (snapshot.ability && inDarkness) {
      context.onPhase(new Phaser.Math.Vector2(this.x, this.y));
      const stats = context.state.getSaveData().stats;
      context.state.updateStat('debt', Math.min(stats.debtCap, stats.debt + 5));
    }

    if (snapshot.swap && this.swapCooldown <= 0) {
      this.swapCooldown = 1000;
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
    }
    if (this.swapCooldown > 0) {
      this.swapCooldown -= dt;
    }
  }
}
