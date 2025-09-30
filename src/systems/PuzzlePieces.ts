import Phaser from 'phaser';

import LightSystem from './LightSystem';

export class MovableMirror extends Phaser.GameObjects.Sprite {
  private angleStep = 15;

  private currentAngle = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'tiles');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setFrame(7);
    this.setInteractive();
    this.on('pointerdown', () => this.rotate());
  }

  rotate(): void {
    this.currentAngle = (this.currentAngle + this.angleStep) % 360;
  }

  getAngle(): number {
    return this.currentAngle;
  }
}

export class PressurePlate extends Phaser.GameObjects.Zone {
  private activated = false;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly callback: () => void) {
    super(scene, x, y, 16, 16);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  checkActivation(player: Phaser.GameObjects.Sprite, shadow: Phaser.GameObjects.Sprite): void {
    const playerOverlap = Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), this.getBounds());
    const shadowOverlap = Phaser.Geom.Intersects.RectangleToRectangle(shadow.getBounds(), this.getBounds());
    if (playerOverlap && shadowOverlap && !this.activated) {
      this.activated = true;
      this.callback();
    }
  }
}

export class LightGate extends Phaser.GameObjects.Rectangle {
  private open = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height, 0x778da9, 0.6);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }

  openGate(): void {
    this.open = true;
    this.setVisible(false);
    (this.body as Phaser.Physics.Arcade.Body).checkCollision.none = true;
  }

  isOpen(): boolean {
    return this.open;
  }
}

export class RotatingLamp {
  private angle = 0;

  constructor(private readonly light: LightSystem, private readonly source: { x: number; y: number; radius: number; intensity: number }) {
    this.updateLight();
  }

  rotate(deltaAngle: number): void {
    this.angle = (this.angle + deltaAngle) % 360;
    this.updateLight();
  }

  getAngle(): number {
    return this.angle;
  }

  private updateLight(): void {
    const radians = Phaser.Math.DegToRad(this.angle);
    const offset = new Phaser.Math.Vector2(Math.cos(radians), Math.sin(radians)).scale(this.source.radius / 2);
    this.light.setLanternPosition(this.source.x + offset.x, this.source.y + offset.y, this.source.radius, this.source.intensity);
  }
}
