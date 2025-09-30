import Phaser from 'phaser';

import { InputSnapshot } from '../core/input/InputManager';
import GameState from '../core/state/GameState';

export interface PlayerConfig {
  speed: number;
  dashSpeed: number;
  dashCost: number;
  attackCooldown: number;
}

export interface PlayerContext {
  state: GameState;
  lightLevel: number;
  delta: number;
  onAttack: (hitbox: Phaser.Geom.Rectangle, damage: number) => void;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private dashTimer = 0;

  private attackTimer = 0;

  private dashCooldown = 0;

  private readonly config: PlayerConfig;

  private controlled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, config?: Partial<PlayerConfig>) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setSize(8, 8);
    this.play('player-idle');

    this.config = {
      speed: 70,
      dashSpeed: 140,
      dashCost: 15,
      attackCooldown: 320,
      ...config,
    };
  }

  setControlled(value: boolean): void {
    this.controlled = value;
  }

  updateFromInput(snapshot: InputSnapshot, context: PlayerContext): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setDrag(400, 400);

    if (!this.controlled) {
      body.setVelocity(0, 0);
      return;
    }

    const dt = context.delta;
    const moveX = (snapshot.left ? -1 : 0) + (snapshot.right ? 1 : 0);
    const moveY = (snapshot.up ? -1 : 0) + (snapshot.down ? 1 : 0);
    const inShadow = context.lightLevel < 0.25;
    const modifier = inShadow ? 0.6 : 1;

    const speed = this.config.speed * modifier;
    body.setVelocity(moveX * speed, moveY * speed);

    if (snapshot.dash && context.state.getSaveData().stats.stamina > this.config.dashCost && this.dashCooldown <= 0) {
      const dashSpeed = this.config.dashSpeed;
      body.setVelocity(moveX * dashSpeed, moveY * dashSpeed);
      context.state.updateStat('stamina', Math.max(0, context.state.getSaveData().stats.stamina - this.config.dashCost));
      this.dashTimer = 150;
      this.dashCooldown = 400;
    }

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    if (snapshot.attack && this.attackTimer <= 0) {
      const hitbox = new Phaser.Geom.Rectangle(this.x - 6, this.y - 6, 12, 12);
      context.onAttack(hitbox, 10);
      this.attackTimer = this.config.attackCooldown;
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
    }
  }
}
