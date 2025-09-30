export interface QuestProgress {
  id: string;
  objectives: boolean[];
  completed: boolean;
}

export interface SaveData {
  location: { scene: string; entry: string };
  stats: { hp: number; stamina: number; debt: number; debtCap: number; lanternFuel: number };
  inventory: Record<string, number>;
  quests: QuestProgress[];
  flags: Record<string, boolean>;
}

const STORAGE_KEY = 'shadow-pact-save';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const memoryStorage = new MemoryStorage();

export default class GameState {
  private data: SaveData;

  constructor() {
    this.data = {
      location: { scene: 'TitleScene', entry: 'start' },
      stats: { hp: 100, stamina: 100, debt: 0, debtCap: 100, lanternFuel: 100 },
      inventory: { lantern: 1, fuel: 2 },
      quests: [],
      flags: {},
    };
  }

  newGame(): void {
    this.data = {
      location: { scene: 'OverworldScene', entry: 'town' },
      stats: { hp: 100, stamina: 100, debt: 0, debtCap: 100, lanternFuel: 100 },
      inventory: { lantern: 1, fuel: 2 },
      quests: [],
      flags: {},
    };
  }

  getSaveData(): SaveData {
    return JSON.parse(JSON.stringify(this.data)) as SaveData;
  }

  setLocation(scene: string, entry: string): void {
    this.data.location = { scene, entry };
  }

  updateStat(key: keyof SaveData['stats'], value: number): void {
    this.data.stats[key] = value;
  }

  addItem(id: string, amount = 1): void {
    this.data.inventory[id] = (this.data.inventory[id] ?? 0) + amount;
  }

  removeItem(id: string, amount = 1): boolean {
    if ((this.data.inventory[id] ?? 0) < amount) {
      return false;
    }
    this.data.inventory[id] -= amount;
    if (this.data.inventory[id] <= 0) {
      delete this.data.inventory[id];
    }
    return true;
  }

  hasItem(id: string, amount = 1): boolean {
    return (this.data.inventory[id] ?? 0) >= amount;
  }

  upsertQuest(id: string, objectives: number): QuestProgress {
    const existing = this.data.quests.find((quest) => quest.id === id);
    if (existing) {
      return existing;
    }
    const quest: QuestProgress = {
      id,
      objectives: Array.from({ length: objectives }, () => false),
      completed: false,
    };
    this.data.quests.push(quest);
    return quest;
  }

  completeObjective(id: string, index: number): void {
    const quest = this.data.quests.find((q) => q.id === id);
    if (!quest) {
      return;
    }
    quest.objectives[index] = true;
    quest.completed = quest.objectives.every(Boolean);
  }

  setFlag(flag: string, value: boolean): void {
    this.data.flags[flag] = value;
  }

  getFlag(flag: string): boolean {
    return this.data.flags[flag] ?? false;
  }

  load(): SaveData | null {
    const storage = this.getStorage();
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as SaveData;
    this.data = parsed;
    return this.getSaveData();
  }

  save(): void {
    const storage = this.getStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private getStorage(): Pick<Storage, 'getItem' | 'setItem'> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return memoryStorage;
  }
}
