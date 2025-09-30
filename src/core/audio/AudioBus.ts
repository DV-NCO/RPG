import Phaser from 'phaser';

interface VolumeSettings {
  music: number;
  sfx: number;
}

export default class AudioBus {
  private music?: Phaser.Sound.BaseSound;

  private settings: VolumeSettings = { music: 0.4, sfx: 0.7 };

  constructor(private readonly game: Phaser.Game) {}

  playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
    const scene = this.game.scene.getScene('TitleScene') ?? this.game.scene.getScenes(true)[0];
    if (!scene) {
      return;
    }
    const sound = scene.sound.add(key, { loop: true, volume: this.settings.music, ...config });
    sound.play();
    this.music = sound;
  }

  playSfx(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    scene.sound.play(key, { volume: this.settings.sfx, ...config });
  }

  setMusicVolume(volume: number): void {
    this.settings.music = Phaser.Math.Clamp(volume, 0, 1);
    if (this.music) {
      (this.music as Phaser.Sound.BaseSound & { setVolume: (value: number) => void }).setVolume(
        this.settings.music,
      );
    }
  }

  setSfxVolume(volume: number): void {
    this.settings.sfx = Phaser.Math.Clamp(volume, 0, 1);
  }

  getSettings(): VolumeSettings {
    return { ...this.settings };
  }
}
