import Phaser from 'phaser';

import items from '../data/items.json';
import dialogs from '../data/dialogs.json';
import quests from '../data/quests.json';
import npcs from '../data/npcs.json';
import { NES_PALETTE } from '../styles/palette';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.cache.json.add('items', items);
    this.cache.json.add('dialogs', dialogs);
    this.cache.json.add('quests', quests);
    this.cache.json.add('npcs', npcs);

    this.createAnimations();
  }

  create(): void {
    this.scene.start('TitleScene');
  }

  private createAnimations(): void {
    const paletteColors = NES_PALETTE.map((color) => Phaser.Display.Color.HexStringToColor(color).color);
    if (!this.textures.exists('player')) {
      return;
    }
    const playerTexture = this.textures.get('player');
    const shadowTexture = this.textures.get('shadow');

    if (!this.anims.exists('player-idle')) {
      this.anims.create({
        key: 'player-idle',
        frames: this.anims.generateFrameNumbers('player', {
          start: 0,
          end: playerTexture.frameTotal - 1,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (!this.anims.exists('shadow-idle')) {
      this.anims.create({
        key: 'shadow-idle',
        frames: this.anims.generateFrameNumbers('shadow', {
          start: 0,
          end: shadowTexture.frameTotal - 1,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    paletteColors.forEach((color, index) => {
      const key = `flash-${index}`;
      if (this.textures.exists(key)) {
        return;
      }
      const canvas = this.textures.createCanvas(key, 2, 2);
      if (!canvas) {
        return;
      }
      const context = canvas.getContext();
      context.fillStyle = Phaser.Display.Color.IntegerToColor(color).rgba;
      context.fillRect(0, 0, 2, 2);
      canvas.refresh();
    });
  }
}
