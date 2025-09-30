import Phaser from 'phaser';

import InputManager from '../core/input/InputManager';
import GameState from '../core/state/GameState';
import PhaserGame from '../game/PhaserGame';
import BossWarden from '../entities/BossWarden';
import Player from '../entities/Player';
import Shadow from '../entities/Shadow';
import CombatSystem from '../systems/CombatSystem';
import LightSystem from '../systems/LightSystem';
import ShadowDebtSystem from '../systems/ShadowDebtSystem';
import StaminaSystem from '../systems/StaminaSystem';
import { MovableMirror, RotatingLamp } from '../systems/PuzzlePieces';
import bossArena from '../maps/bossArena';
import { TILE_SIZE } from '../maps/tileset';

interface SceneData {
  entry?: string;
}

export default class BossScene extends Phaser.Scene {
  private state!: GameState;

  private inputManager!: InputManager;

  private player!: Player;

  private shadow!: Shadow;

  private boss!: BossWarden;

  private lightSystem!: LightSystem;

  private combat!: CombatSystem;

  private stamina!: StaminaSystem;

  private debt!: ShadowDebtSystem;

  private lamp!: RotatingLamp;

  private mirrors: MovableMirror[] = [];

  private controlling: 'player' | 'shadow' = 'player';

  private lanternActive = true;

  private lastLantern = false;

  private bossHp = 300;

  private victory = false;

  constructor() {
    super('BossScene');
  }

  init(_data: SceneData): void {
    const game = this.game as PhaserGame;
    this.state = game.state;
    this.inputManager = game.inputManager;
    this.state.setLocation('BossScene', 'arena');
  }

  create(): void {
    this.inputManager.setKeyboard(
      this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin,
      this.input.gamepad ?? undefined,
    );

    const map = this.make.tilemap({
      width: bossArena.width,
      height: bossArena.height,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tiles', undefined, TILE_SIZE, TILE_SIZE, 0, 0) as Phaser.Tilemaps.Tileset;
    const layers = bossArena.layers.map((layerData, index) => {
      const layer = map.createBlankLayer(`layer-${index}`, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
      layer.setScale(2);
      layer.setDepth(index);
      for (let y = 0; y < layerData.length; y += 1) {
        for (let x = 0; x < layerData[y].length; x += 1) {
          layer.putTileAt(layerData[y][x], x, y);
        }
      }
      layer.setCollision(bossArena.collisions, true);
      return layer;
    });

    this.lightSystem = new LightSystem();
    this.lightSystem.loadStaticSources(bossArena.lightSources);

    this.player = new Player(this, bossArena.spawn.player.x, bossArena.spawn.player.y);
    this.shadow = new Shadow(this, bossArena.spawn.shadow.x, bossArena.spawn.shadow.y);
    this.shadow.setControlled(false);

    layers.forEach((layer) => {
      this.physics.add.collider(this.player, layer);
      this.physics.add.collider(this.shadow, layer);
    });

    this.boss = new BossWarden(this, bossArena.enemies[0].x, bossArena.enemies[0].y);

    this.combat = new CombatSystem(this);
    this.combat.watchPlayerCollisions(this.player);
    this.combat.watchShadowCollisions(this.shadow);
    this.combat.registerEnemy(this.boss);

    this.stamina = new StaminaSystem(this.state);
    this.debt = new ShadowDebtSystem(this.state);
    this.debt.on('curseApplied', () => this.game.events.emit('hud:hint', 'The Warden fuels your debt!'));

    this.lamp = new RotatingLamp(this.lightSystem, {
      x: bossArena.puzzles[0].x,
      y: bossArena.puzzles[0].y,
      radius: 100,
      intensity: 1,
    });

    bossArena.puzzles.forEach((puzzle) => {
      if (puzzle.type === 'rotating_lamp') {
        // already handled by lamp
      } else if (puzzle.type === 'mirror_corridor') {
        this.mirrors.push(new MovableMirror(this, puzzle.x, puzzle.y));
      }
    });

    this.input.keyboard?.on('keydown-Q', () => this.swapControl());
  }

  override update(_time: number, delta: number): void {
    const snapshot = this.inputManager.getSnapshot(this.input.activePointer);

    if (snapshot.lantern && !this.lastLantern) {
      this.lanternActive = !this.lanternActive;
    }
    this.lastLantern = snapshot.lantern;
    if (this.lanternActive) {
      this.lightSystem.setLanternPosition(this.player.x, this.player.y, 90, 1);
    } else {
      this.lightSystem.setLanternPosition(-999, -999, 10, 0);
    }

    if (snapshot.interact) {
      this.lamp.rotate(20);
      this.mirrors.forEach((mirror) => mirror.rotate());
    }

    const playerLight = this.lightSystem.getLightLevel(this.player.x, this.player.y);
    const shadowLight = this.lightSystem.getLightLevel(this.shadow.x, this.shadow.y);

    this.player.updateFromInput(snapshot, {
      state: this.state,
      lightLevel: playerLight,
      delta,
      onAttack: (hitbox, damage) => this.handlePlayerAttack(hitbox, damage),
    });
    this.shadow.updateFromInput(snapshot, {
      state: this.state,
      lightLevel: shadowLight,
      delta,
      onAttack: (hitbox, damage) => this.handlePlayerAttack(hitbox, damage),
      onPhase: () => this.onShadowPhase(),
    });
    this.shadow.applyLightDamage(delta, shadowLight, this.state);

    this.stamina.update(delta);
    this.debt.update(delta);
    this.boss.updatePhase(delta);

    if (!this.victory && this.bossHp <= 0) {
      this.victory = true;
      this.time.delayedCall(1000, () => {
        this.game.events.emit('hud:hint', 'Warden defeated! Emberwatch is safe.');
        this.scene.start('OverworldScene', { entry: 'town' });
      });
    }

    this.game.events.emit('hud:update');
  }

  private swapControl(): void {
    if (!this.shadow.canSwap()) {
      return;
    }
    if (this.controlling === 'player') {
      this.player.setControlled(false);
      this.shadow.setControlled(true);
      this.controlling = 'shadow';
    } else {
      this.player.setControlled(true);
      this.shadow.setControlled(false);
      this.controlling = 'player';
    }
    this.shadow.markSwapped();
    this.sound.play('swap');
  }

  private handlePlayerAttack(hitbox: Phaser.Geom.Rectangle, damage: number): void {
    if (Phaser.Geom.Rectangle.Overlaps(hitbox, this.boss.getBounds())) {
      const lightOnBoss = this.lightSystem.getLightLevel(this.boss.x, this.boss.y);
      const scaledDamage = lightOnBoss > 0.5 ? damage * 2 : damage * 0.5;
      const defeated = this.boss.takeDamage(scaledDamage);
      this.bossHp -= scaledDamage;
      if (defeated) {
        this.bossHp = 0;
      }
    }
  }

  private onShadowPhase(): void {
    this.debt.increase(8);
    this.game.events.emit('hud:hint', 'Shadow phased through the Warden guard.');
  }
}
