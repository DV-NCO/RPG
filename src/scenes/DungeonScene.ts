import Phaser from 'phaser';

import InputManager, { InputSnapshot } from '../core/input/InputManager';
import GameState from '../core/state/GameState';
import PhaserGame from '../game/PhaserGame';
import Player from '../entities/Player';
import Shadow from '../entities/Shadow';
import Lightborn from '../entities/enemies/Lightborn';
import Nightborn from '../entities/enemies/Nightborn';
import CombatSystem from '../systems/CombatSystem';
import LightSystem from '../systems/LightSystem';
import QuestLog, { QuestDefinition } from '../systems/QuestLog';
import ShadowDebtSystem from '../systems/ShadowDebtSystem';
import StaminaSystem from '../systems/StaminaSystem';
import { LightGate, MovableMirror, PressurePlate, RotatingLamp } from '../systems/PuzzlePieces';
import dungeon1 from '../maps/dungeon1';
import { MapDescriptor, TILE_SIZE } from '../maps/tileset';

interface SceneData {
  entry?: 'entrance' | 'lightworks';
}

export default class DungeonScene extends Phaser.Scene {
  private state!: GameState;

  private inputManager!: InputManager;

  private player!: Player;

  private shadow!: Shadow;

  private lightSystem!: LightSystem;

  private combat!: CombatSystem;

  private stamina!: StaminaSystem;

  private debt!: ShadowDebtSystem;

  private questLog!: QuestLog;

  private currentMap: MapDescriptor = dungeon1;

  private gate?: LightGate;

  private mirror?: MovableMirror;

  private plates: PressurePlate[] = [];

  private lamp?: RotatingLamp;

  private spawnOverride?: { player: { x: number; y: number }; shadow: { x: number; y: number } };

  private controlling: 'player' | 'shadow' = 'player';

  private lanternActive = true;

  private lastLantern = false;

  constructor() {
    super('DungeonScene');
  }

  init(data: SceneData): void {
    const game = this.game as PhaserGame;
    this.state = game.state;
    this.inputManager = game.inputManager;
    const quests = this.cache.json.get('quests') as QuestDefinition[];
    this.questLog = new QuestLog(this.state);
    this.questLog.register(quests);

    if (data.entry === 'lightworks') {
      this.spawnOverride = {
        player: { x: 12 * TILE_SIZE, y: 12 * TILE_SIZE },
        shadow: { x: 13 * TILE_SIZE, y: 12 * TILE_SIZE },
      };
    } else {
      this.spawnOverride = undefined;
    }
    this.state.setLocation('DungeonScene', data.entry ?? 'entrance');
  }

  create(): void {
    this.inputManager.setKeyboard(
      this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin,
      this.input.gamepad ?? undefined,
    );

    const map = this.make.tilemap({
      width: this.currentMap.width,
      height: this.currentMap.height,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tiles', undefined, TILE_SIZE, TILE_SIZE, 0, 0) as Phaser.Tilemaps.Tileset;
    const layers = this.currentMap.layers.map((layerData, index) => {
      const layer = map.createBlankLayer(`layer-${index}`, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
      layer.setScale(2);
      layer.setDepth(index);
      for (let y = 0; y < layerData.length; y += 1) {
        for (let x = 0; x < layerData[y].length; x += 1) {
          layer.putTileAt(layerData[y][x], x, y);
        }
      }
      return layer;
    });

    this.lightSystem = new LightSystem();
    this.lightSystem.loadStaticSources(this.currentMap.lightSources);

    const spawn = this.spawnOverride ?? this.currentMap.spawn;
    this.player = new Player(this, spawn.player.x, spawn.player.y);
    this.shadow = new Shadow(this, spawn.shadow.x, spawn.shadow.y);
    this.shadow.setControlled(false);

    layers.forEach((layer) => {
      layer.setCollision(this.currentMap.collisions, true);
      this.physics.add.collider(this.player, layer);
      this.physics.add.collider(this.shadow, layer);
    });

    this.combat = new CombatSystem(this);
    this.combat.watchPlayerCollisions(this.player);
    this.combat.watchShadowCollisions(this.shadow);
    this.currentMap.enemies.forEach((spawn) => {
      if (spawn.type === 'lightborn') {
        this.combat.registerEnemy(new Lightborn(this, spawn.x, spawn.y));
      }
      if (spawn.type === 'nightborn') {
        this.combat.registerEnemy(new Nightborn(this, spawn.x, spawn.y));
      }
    });

    this.stamina = new StaminaSystem(this.state);
    this.debt = new ShadowDebtSystem(this.state);
    this.debt.on('curseApplied', () => this.game.events.emit('hud:hint', 'Debt curse grows within the Lightworks.'));

    this.setupPuzzles();
    this.setupExits();

    this.input.keyboard?.on('keydown-Q', () => this.swapControl());
  }

  override update(_time: number, delta: number): void {
    const snapshot = this.inputManager.getSnapshot(this.input.activePointer);

    if (snapshot.lantern && !this.lastLantern) {
      this.lanternActive = !this.lanternActive;
    }
    this.lastLantern = snapshot.lantern;

    if (this.lanternActive) {
      this.lightSystem.setLanternPosition(this.player.x, this.player.y, 80, 1);
    } else {
      this.lightSystem.setLanternPosition(-999, -999, 10, 0);
    }

    const playerLight = this.lightSystem.getLightLevel(this.player.x, this.player.y);
    const shadowLight = this.lightSystem.getLightLevel(this.shadow.x, this.shadow.y);

    this.player.updateFromInput(snapshot, {
      state: this.state,
      lightLevel: playerLight,
      delta,
      onAttack: (hitbox, damage) => this.combat.handleAttack(hitbox, damage),
    });
    this.shadow.updateFromInput(snapshot, {
      state: this.state,
      lightLevel: shadowLight,
      delta,
      onAttack: (hitbox, damage) => this.combat.handleAttack(hitbox, damage),
      onPhase: () => this.onShadowPhase(),
    });
    this.shadow.applyLightDamage(delta, shadowLight, this.state);

    this.stamina.update(delta);
    this.debt.update(delta);

    this.handlePuzzles(snapshot, delta);

    this.game.events.emit('hud:update');
  }

  private setupPuzzles(): void {
    this.currentMap.puzzles.forEach((puzzle) => {
      if (puzzle.type === 'mirror_corridor') {
        this.gate = new LightGate(this, puzzle.x + 16, puzzle.y, 32, 16);
        this.mirror = new MovableMirror(this, puzzle.x, puzzle.y);
      }
      if (puzzle.type === 'pressure_plates') {
        const plateA = new PressurePlate(this, puzzle.x, puzzle.y, () => this.openPlateGate());
        const plateB = new PressurePlate(this, puzzle.x + 16, puzzle.y, () => this.openPlateGate());
        this.plates.push(plateA, plateB);
      }
      if (puzzle.type === 'rotating_lamp') {
        this.lamp = new RotatingLamp(this.lightSystem, {
          x: puzzle.x,
          y: puzzle.y,
          radius: 80,
          intensity: 1,
        });
      }
    });
  }

  private setupExits(): void {
    this.currentMap.exits.forEach((exit) => {
      const zone = this.add.zone(exit.x, exit.y, 20, 20);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        this.scene.start(exit.targetScene, { entry: exit.targetEntry });
      });
    });
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

  private handlePuzzles(snapshot: InputSnapshot, _delta: number): void {
    if (this.mirror && this.gate && this.mirror.getAngle() % 90 === 0 && !this.gate.isOpen()) {
      this.gate.openGate();
      this.questLog.markObjective('dungeon_clear', 0);
      this.updateQuestHud();
    }
    if (this.plates.length >= 2) {
      this.plates.forEach((plate) => plate.checkActivation(this.player, this.shadow));
    }
    if (this.lamp && snapshot.interact) {
      this.lamp.rotate(15);
    }
  }

  private openPlateGate(): void {
    if (!this.gate) {
      this.gate = new LightGate(this, 30 * TILE_SIZE, 16 * TILE_SIZE, 32, 16);
    }
    this.gate.openGate();
    this.questLog.markObjective('dungeon_clear', 1);
    this.updateQuestHud();
  }

  private onShadowPhase(): void {
    this.questLog.markObjective('dungeon_clear', 2);
    this.updateQuestHud();
  }

  private updateQuestHud(): void {
    const active = this.questLog.getActiveQuests();
    const lines = active.map((entry) => {
      const completedCount = entry.progress.objectives.filter(Boolean).length;
      return `${entry.definition.name}: ${completedCount}/${entry.definition.objectives.length}`;
    });
    this.game.events.emit('hud:quests', lines);
  }
}
