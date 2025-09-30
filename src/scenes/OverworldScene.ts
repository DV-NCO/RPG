import Phaser from 'phaser';

import InputManager from '../core/input/InputManager';
import GameState from '../core/state/GameState';
import PhaserGame from '../game/PhaserGame';
import NPC from '../entities/NPC';
import Player from '../entities/Player';
import Shadow from '../entities/Shadow';
import Lightborn from '../entities/enemies/Lightborn';
import Nightborn from '../entities/enemies/Nightborn';
import CombatSystem from '../systems/CombatSystem';
import DialogueSystem, { DialogueNode, DialogueResponse, DialogueScript } from '../systems/Dialogue';
import InventorySystem from '../systems/Inventory';
import LightSystem from '../systems/LightSystem';
import QuestLog, { QuestDefinition } from '../systems/QuestLog';
import ShadowDebtSystem from '../systems/ShadowDebtSystem';
import ShopSystem from '../systems/ShopSystem';
import StaminaSystem from '../systems/StaminaSystem';
import { MovableMirror, LightGate, PressurePlate } from '../systems/PuzzlePieces';
import { loadItemDefinitions } from '../systems/Items';
import district1 from '../maps/district1';
import district2 from '../maps/district2';
import town from '../maps/overworldTown';
import { MapDescriptor, TILE_SIZE } from '../maps/tileset';

const MAPS: Record<string, MapDescriptor> = {
  town,
  district1,
  district2,
};

interface SceneData {
  entry?: keyof typeof MAPS;
}

interface TilemapPayload {
  map: Phaser.Tilemaps.Tilemap;
  layers: Phaser.Tilemaps.TilemapLayer[];
}

export default class OverworldScene extends Phaser.Scene {
  private state!: GameState;

  private inputManager!: InputManager;

  private player!: Player;

  private shadow!: Shadow;

  private lightSystem!: LightSystem;

  private combat!: CombatSystem;

  private stamina!: StaminaSystem;

  private debt!: ShadowDebtSystem;

  private inventory!: InventorySystem;

  private shop!: ShopSystem;

  private dialogue!: DialogueSystem;

  private questLog!: QuestLog;

  private currentMap!: MapDescriptor;

  private controlling: 'player' | 'shadow' = 'player';

  private lanternActive = true;

  private lastLantern = false;

  private dialogueBox?: Phaser.GameObjects.Container;

  private dialogueNode?: DialogueNode;

  private numberKeys: Phaser.Input.Keyboard.Key[] = [];

  private dialogueSpeaker = '';

  private gate?: LightGate;

  private mirror?: MovableMirror;

  private plateGate?: LightGate;

  private plates: PressurePlate[] = [];

  private phaseObjectiveComplete = false;

  constructor() {
    super('OverworldScene');
  }

  init(data: SceneData): void {
    const game = this.game as PhaserGame;
    this.state = game.state;
    this.inputManager = game.inputManager;
    const entry = data.entry ?? 'town';
    this.currentMap = MAPS[entry] ?? town;
    this.state.setLocation('OverworldScene', entry);
  }

  create(): void {
    this.inputManager.setKeyboard(
      this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin,
      this.input.gamepad ?? undefined,
    );

    const tilemap = this.createTilemap();
    this.lightSystem = new LightSystem();
    this.lightSystem.loadStaticSources(this.currentMap.lightSources);

    this.player = new Player(this, this.currentMap.spawn.player.x, this.currentMap.spawn.player.y);
    this.shadow = new Shadow(this, this.currentMap.spawn.shadow.x, this.currentMap.spawn.shadow.y);
    this.shadow.setControlled(false);

    this.setupCollisions(tilemap.layers);

    this.combat = new CombatSystem(this);
    this.combat.watchPlayerCollisions(this.player);
    this.combat.watchShadowCollisions(this.shadow);

    this.stamina = new StaminaSystem(this.state);
    this.debt = new ShadowDebtSystem(this.state);
    this.inventory = new InventorySystem(this.state);
    this.shop = new ShopSystem(this.inventory);
    this.dialogue = new DialogueSystem();

    const questData = this.cache.json.get('quests') as QuestDefinition[];
    this.questLog = new QuestLog(this.state);
    this.questLog.register(questData);

    const dialogData = this.cache.json.get('dialogs') as Record<string, DialogueScript>;
    Object.entries(dialogData).forEach(([id, script]) => this.dialogue.load(id, script));

    this.spawnNPCs();
    this.spawnEnemies();
    this.setupPuzzles();
    this.setupExits();

    this.input.keyboard?.on('keydown-Q', () => this.trySwap());

    this.numberKeys = [
      this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ONE) as Phaser.Input.Keyboard.Key,
      this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.TWO) as Phaser.Input.Keyboard.Key,
      this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.THREE) as Phaser.Input.Keyboard.Key,
    ];

    this.debt.on('curseApplied', () => this.game.events.emit('hud:hint', 'Debt curse applied! Appease at a shrine.'));
    this.debt.on('curseCleared', () => this.game.events.emit('hud:hint', 'Debt eased.'));

    this.combat.on('playerDamaged', (amount: number) => {
      const stats = this.state.getSaveData().stats;
      this.state.updateStat('hp', Math.max(0, stats.hp - amount));
      this.game.events.emit('hud:hint', 'You were hit!');
    });
    this.combat.on('shadowDamaged', (amount: number) => {
      const stats = this.state.getSaveData().stats;
      this.state.updateStat('hp', Math.max(0, stats.hp - amount / 2));
    });

    this.game.events.emit('hud:hint', 'Explore Emberwatch. Press E to interact.');
    this.updateQuestHud();
  }

  override update(_time: number, delta: number): void {
    const snapshot = this.inputManager.getSnapshot(this.input.activePointer);

    if (!this.dialogueNode) {
      if (snapshot.interact) {
        this.handleInteraction();
      }
    } else {
      this.updateDialogue();
    }

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

    this.handlePuzzles();

    this.game.events.emit('hud:update');
  }

  private createTilemap(): TilemapPayload {
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
    return { map, layers };
  }

  private setupCollisions(layers: Phaser.Tilemaps.TilemapLayer[]): void {
    layers.forEach((layer) => {
      layer.setCollision(this.currentMap.collisions, true);
      this.physics.add.collider(this.player, layer);
      this.physics.add.collider(this.shadow, layer);
    });
  }

  private spawnNPCs(): void {
    const npcDefs = this.cache.json.get('npcs') as { id: string; name: string; dialog: string; role: string }[];
    this.currentMap.npcs.forEach((spawn) => {
      const def = npcDefs.find((n) => n.id === spawn.id);
      if (!def) {
        return;
      }
      const npc = new NPC(this, spawn.x, spawn.y, 'player', def.id);
      npc.setTint(0x7777ff);
      this.physics.add.overlap(this.player, npc, () => {
        this.game.events.emit('hud:hint', `Press E to speak with ${def.name}`);
      });
    });
  }

  private spawnEnemies(): void {
    this.currentMap.enemies.forEach((spawn) => {
      let enemy: Phaser.GameObjects.Sprite | null = null;
      if (spawn.type === 'lightborn') {
        enemy = new Lightborn(this, spawn.x, spawn.y);
      } else if (spawn.type === 'nightborn') {
        enemy = new Nightborn(this, spawn.x, spawn.y);
      }
      if (enemy instanceof Lightborn || enemy instanceof Nightborn) {
        this.combat.registerEnemy(enemy);
      }
    });
  }

  private setupPuzzles(): void {
    this.currentMap.puzzles.forEach((puzzle) => {
      if (puzzle.type === 'mirror_corridor') {
        this.gate = new LightGate(this, puzzle.x + 16, puzzle.y, 32, 16);
        this.mirror = new MovableMirror(this, puzzle.x, puzzle.y);
      }
      if (puzzle.type === 'pressure_plates') {
        this.plateGate = new LightGate(
          this,
          (puzzle.options?.gateX as number) ?? puzzle.x,
          (puzzle.options?.gateY as number) ?? puzzle.y,
          32,
          16,
        );
        const plateA = new PressurePlate(this, puzzle.x, puzzle.y, () => this.plateGate?.openGate());
        const plateB = new PressurePlate(this, puzzle.x + 16, puzzle.y, () => this.plateGate?.openGate());
        this.plates.push(plateA, plateB);
      }
      if (puzzle.type === 'shadow_maze') {
        this.phaseObjectiveComplete = false;
      }
      if (puzzle.type === 'shrine') {
        const shrine = this.add.rectangle(puzzle.x, puzzle.y, 20, 20, 0x5b8e7d, 0.5);
        this.physics.add.existing(shrine, true);
        this.physics.add.overlap(this.player, shrine, () => {
          this.game.events.emit('hud:hint', 'Hold E to appease debt with fuel.');
        });
      }
    });
  }

  private setupExits(): void {
    this.currentMap.exits.forEach((exit) => {
      const zone = this.add.zone(exit.x, exit.y, 16, 16);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => {
        this.scene.start(exit.targetScene, { entry: exit.targetEntry });
      });
    });
  }

  private trySwap(): void {
    const shadowLight = this.lightSystem.getLightLevel(this.shadow.x, this.shadow.y);
    if (this.controlling === 'player') {
      if (!this.shadow.canSwap()) {
        return;
      }
      this.controlling = 'shadow';
      this.player.setControlled(false);
      this.shadow.setControlled(true);
      if (shadowLight > 0.6) {
        this.shadow.applyLightDamage(200, shadowLight, this.state);
      }
      this.shadow.markSwapped();
    } else {
      if (!this.shadow.canSwap()) {
        return;
      }
      this.controlling = 'player';
      this.player.setControlled(true);
      this.shadow.setControlled(false);
      this.shadow.markSwapped();
    }
    this.sound.play('swap');
  }

  private handleInteraction(): void {
    const npcs = this.currentMap.npcs;
    const npcDefs = this.cache.json.get('npcs') as { id: string; name: string; dialog: string; role: string }[];
    const closeNpc = npcs.find((npc) => Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) < 24);
    if (closeNpc) {
      const def = npcDefs.find((n) => n.id === closeNpc.id);
      if (def) {
        this.startDialogue(def.name, def.dialog);
        return;
      }
    }

    if (this.currentMap.puzzles.some((p) => p.type === 'shrine') && this.state.getSaveData().stats.lanternFuel > 0) {
      this.debt.appease(15);
      this.game.events.emit('hud:hint', 'Debt lowered at shrine.');
    }
  }

  private startDialogue(name: string, dialogId: string): void {
    this.dialogueNode = this.dialogue.start(dialogId) ?? undefined;
    this.dialogueSpeaker = this.dialogueNode?.speaker ?? name;
    this.createDialogueBox();
  }

  private createDialogueBox(): void {
    this.dialogueBox?.destroy();
    const box = this.add.container(20, 110);
    const bg = this.add.rectangle(0, 0, 280, 60, 0x000000, 0.7).setOrigin(0, 0);
    const text = this.add.text(6, 6, '', { fontFamily: 'monospace', fontSize: '8px', color: '#e0e1dd', wordWrap: { width: 268 } });
    const responses: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i += 1) {
      const responseText = this.add.text(6, 28 + i * 10, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f4a259',
      });
      responses.push(responseText);
    }
    box.add([bg, text, ...responses]);
    this.dialogueBox = box;
    this.updateDialogueBox(text, responses);
  }

  private updateDialogue(): void {
    if (!this.dialogueNode || !this.dialogueBox) {
      return;
    }
    this.numberKeys.forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(key) && this.dialogueNode) {
        const response = this.dialogueNode.responses[index];
        if (response) {
          this.selectResponse(response);
        }
      }
    });
  }

  private updateDialogueBox(text: Phaser.GameObjects.Text, responses: Phaser.GameObjects.Text[]): void {
    if (!this.dialogueNode) {
      return;
    }
    this.dialogueSpeaker = this.dialogueNode.speaker ?? this.dialogueSpeaker;
    text.setText(`${this.dialogueSpeaker}: ${this.dialogueNode.text}`);
    responses.forEach((label, index) => {
      const response = this.dialogueNode?.responses[index];
      label.setText(response ? `${index + 1}. ${response.text}` : '');
    });
  }

  private selectResponse(response: DialogueResponse): void {
    if (response.setQuest) {
      this.questLog.activateQuest(response.setQuest);
      this.updateQuestHud();
    }
    if (response.shop) {
      const itemDefs = loadItemDefinitions(this.cache.json.get('items'));
      const item = itemDefs.find((def) => def.id === response.shop);
      if (item) {
        if (this.shop.purchase({ item, quantity: 1 })) {
          this.game.events.emit('hud:hint', `${item.name} acquired.`);
        } else {
          this.game.events.emit('hud:hint', `Not enough credits for ${item.name}.`);
        }
      }
    }
    this.dialogueNode = this.dialogue.choose(response) ?? undefined;
    if (!this.dialogueNode) {
      this.dialogueBox?.destroy();
      this.dialogueBox = undefined;
      this.dialogueSpeaker = '';
      return;
    }
    const children = this.dialogueBox?.list ?? [];
    const text = children[1] as Phaser.GameObjects.Text;
    const responses = children.slice(2) as Phaser.GameObjects.Text[];
    this.dialogueSpeaker = this.dialogueNode.speaker ?? this.dialogueSpeaker;
    this.updateDialogueBox(text, responses);
  }

  private handlePuzzles(): void {
    if (this.mirror && this.gate && this.mirror.getAngle() % 90 === 0 && !this.gate.isOpen()) {
      this.gate.openGate();
      this.questLog.markObjective('dungeon_clear', 0);
      this.updateQuestHud();
    }
    if (this.plateGate && this.plates.length >= 2) {
      this.plates.forEach((plate) => plate.checkActivation(this.player, this.shadow));
      if (this.plateGate.isOpen()) {
        this.questLog.markObjective('dungeon_clear', 1);
        this.updateQuestHud();
      }
    }
    if (this.phaseObjectiveComplete) {
      this.questLog.markObjective('dungeon_clear', 2);
      this.updateQuestHud();
    }
  }

  private updateQuestHud(): void {
    const active = this.questLog.getActiveQuests();
    const lines = active.map((entry) => {
      const completedCount = entry.progress.objectives.filter(Boolean).length;
      return `${entry.definition.name}: ${completedCount}/${entry.definition.objectives.length}`;
    });
    this.game.events.emit('hud:quests', lines);
  }

  private onShadowPhase(): void {
    if (!this.phaseObjectiveComplete) {
      this.phaseObjectiveComplete = true;
      this.game.events.emit('hud:hint', 'Shadow phased through barrier!');
    }
  }
}
