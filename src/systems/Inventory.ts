import GameState from '../core/state/GameState';
import { ItemDefinition } from './Items';

export default class InventorySystem {
  private credits = 120;

  constructor(private readonly state: GameState) {}

  addItem(id: string, amount = 1): void {
    this.state.addItem(id, amount);
  }

  consumeItem(id: string, amount = 1): boolean {
    return this.state.removeItem(id, amount);
  }

  hasItem(id: string, amount = 1): boolean {
    return this.state.hasItem(id, amount);
  }

  getCredits(): number {
    return this.credits;
  }

  addCredits(amount: number): void {
    this.credits += amount;
  }

  spendCredits(amount: number): boolean {
    if (this.credits < amount) {
      return false;
    }
    this.credits -= amount;
    return true;
  }

  listItems(): Record<string, number> {
    return this.state.getSaveData().inventory;
  }

  applyItemEffect(item: ItemDefinition): void {
    const stats = this.state.getSaveData().stats;
    if (item.id === 'fuel') {
      this.state.updateStat('lanternFuel', Math.min(150, stats.lanternFuel + 40));
    }
    if (item.id === 'charm_stamina') {
      this.state.updateStat('stamina', Math.min(130, stats.stamina + 20));
    }
    if (item.id === 'charm_debt') {
      this.state.updateStat('debtCap', stats.debtCap + 20);
    }
  }
}
