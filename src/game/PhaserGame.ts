import Phaser from 'phaser';

import AudioBus from '../core/audio/AudioBus';
import InputManager from '../core/input/InputManager';
import GameState from '../core/state/GameState';
import BootScene from '../scenes/BootScene';
import BossScene from '../scenes/BossScene';
import DungeonScene from '../scenes/DungeonScene';
import OverworldScene from '../scenes/OverworldScene';
import PreloadScene from '../scenes/PreloadScene';
import TitleScene from '../scenes/TitleScene';
import UIScene from '../scenes/UIScene';

export default class PhaserGame extends Phaser.Game {
  readonly state: GameState;

  readonly inputManager: InputManager;

  readonly audio: AudioBus;

  constructor(parent: HTMLElement) {
    const width = 320;
    const height = 180;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent,
      pixelArt: true,
      backgroundColor: '#070b16',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width,
        height,
      },
      scene: [BootScene, PreloadScene, TitleScene, OverworldScene, DungeonScene, BossScene, UIScene],
      fps: {
        target: 60,
        forceSetTimeOut: true,
      },
    };

    super(config);

    this.state = new GameState();
    this.inputManager = new InputManager(this);
    this.audio = new AudioBus(this);

  }
}
