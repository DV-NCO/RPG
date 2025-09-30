import Phaser from 'phaser';

export interface InputSnapshot {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  dash: boolean;
  attack: boolean;
  interact: boolean;
  swap: boolean;
  lantern: boolean;
  inventory: boolean;
  pause: boolean;
  ability: boolean;
  aimX: number;
  aimY: number;
}

export const DEFAULT_KEY_BINDINGS = {
  left: [Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.LEFT],
  right: [Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.RIGHT],
  up: [Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.UP],
  down: [Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.DOWN],
  dash: [Phaser.Input.Keyboard.KeyCodes.SHIFT],
  attack: [Phaser.Input.Keyboard.KeyCodes.SPACE],
  interact: [Phaser.Input.Keyboard.KeyCodes.E],
  swap: [Phaser.Input.Keyboard.KeyCodes.Q],
  lantern: [Phaser.Input.Keyboard.KeyCodes.F],
  inventory: [Phaser.Input.Keyboard.KeyCodes.TAB],
  pause: [Phaser.Input.Keyboard.KeyCodes.ESC],
  ability: [Phaser.Input.Keyboard.KeyCodes.R],
} as const;

export default class InputManager {
  private keyboard?: Phaser.Input.Keyboard.KeyboardPlugin;

  private gamepad?: Phaser.Input.Gamepad.Gamepad;

  private gamepadPlugin?: Phaser.Input.Gamepad.GamepadPlugin;

  private keyLookup: Map<number, Phaser.Input.Keyboard.Key> = new Map();

  constructor(private readonly game: Phaser.Game) {
    this.game.events.on('step', this.updateGamepad, this);
  }

  setKeyboard(
    keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
    gamepad?: Phaser.Input.Gamepad.GamepadPlugin,
  ): void {
    this.keyboard = keyboard;
    this.gamepadPlugin = gamepad;
    this.keyLookup.forEach((key) => key.destroy());
    this.keyLookup.clear();
    Object.values(DEFAULT_KEY_BINDINGS).forEach((codes) => {
      codes.forEach((code) => {
        if (!this.keyLookup.has(code)) {
          this.keyLookup.set(code, keyboard.addKey(code));
        }
      });
    });
  }

  private updateGamepad(): void {
    const pads = this.gamepadPlugin?.gamepads ?? [];
    this.gamepad = pads.find((pad: Phaser.Input.Gamepad.Gamepad | undefined) => pad?.connected) ?? undefined;
  }

  getSnapshot(pointer: Phaser.Input.Pointer | null): InputSnapshot {
    const snapshot: InputSnapshot = {
      left: this.isActive('left'),
      right: this.isActive('right'),
      up: this.isActive('up'),
      down: this.isActive('down'),
      dash: this.isActive('dash'),
      attack: this.isActive('attack'),
      interact: this.isActive('interact'),
      swap: this.isActive('swap'),
      lantern: this.isActive('lantern'),
      inventory: this.isActive('inventory'),
      pause: this.isActive('pause'),
      ability: this.isActive('ability'),
      aimX: 0,
      aimY: 0,
    };

    if (pointer) {
      const camera = this.game.scene.getScene('UIScene').cameras.main;
      const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
      snapshot.aimX = worldPoint.x;
      snapshot.aimY = worldPoint.y;
    }

    if (this.gamepad) {
      const pad = this.gamepad;
      snapshot.left = snapshot.left || pad.leftStick.x < -0.2 || pad.buttons[14]?.pressed;
      snapshot.right = snapshot.right || pad.leftStick.x > 0.2 || pad.buttons[15]?.pressed;
      snapshot.up = snapshot.up || pad.leftStick.y < -0.2 || pad.buttons[12]?.pressed;
      snapshot.down = snapshot.down || pad.leftStick.y > 0.2 || pad.buttons[13]?.pressed;
      snapshot.attack = snapshot.attack || pad.buttons[0]?.pressed;
      snapshot.dash = snapshot.dash || pad.buttons[1]?.pressed;
      snapshot.interact = snapshot.interact || pad.buttons[2]?.pressed;
      snapshot.swap = snapshot.swap || pad.buttons[3]?.pressed;
      snapshot.lantern = snapshot.lantern || pad.buttons[7]?.pressed || pad.buttons[6]?.pressed;
    }

    return snapshot;
  }

  private isActive(action: keyof typeof DEFAULT_KEY_BINDINGS): boolean {
    const keyboard = this.keyboard;
    if (!keyboard) {
      return false;
    }
    return DEFAULT_KEY_BINDINGS[action].some((code) => this.keyLookup.get(code)?.isDown ?? false);
  }
}
