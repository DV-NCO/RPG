import GameState, { QuestProgress } from '../core/state/GameState';

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  objectives: string[];
}

export default class QuestLog {
  private quests: Map<string, QuestDefinition> = new Map();

  constructor(private readonly state: GameState) {}

  register(definitions: QuestDefinition[]): void {
    definitions.forEach((def) => this.quests.set(def.id, def));
  }

  activateQuest(id: string): QuestProgress | null {
    const quest = this.quests.get(id);
    if (!quest) {
      return null;
    }
    return this.state.upsertQuest(id, quest.objectives.length);
  }

  markObjective(id: string, index: number): void {
    this.state.completeObjective(id, index);
  }

  getActiveQuests(): { definition: QuestDefinition; progress: QuestProgress }[] {
    const data = this.state.getSaveData();
    return data.quests
      .map((progress) => {
        const def = this.quests.get(progress.id);
        return def ? { definition: def, progress } : null;
      })
      .filter((entry): entry is { definition: QuestDefinition; progress: QuestProgress } => Boolean(entry));
  }
}
