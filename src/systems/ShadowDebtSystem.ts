import { EventEmitter } from 'events';

import GameState from '../core/state/GameState';

export interface DebtCurse {
  id: string;
  description: string;
}

const CURSE_THRESHOLDS: DebtCurse[] = [
  { id: 'low_regen', description: 'Stamina regen reduced.' },
  { id: 'flicker', description: 'Lantern flickers randomly.' },
  { id: 'hp_bleed', description: 'Gradual HP drain.' }
];

export default class ShadowDebtSystem extends EventEmitter {
  private activeCurses = new Set<string>();

  constructor(private readonly state: GameState) {
    super();
  }

  update(delta: number): void {
    const stats = this.state.getSaveData().stats;
    CURSE_THRESHOLDS.forEach((curse, index) => {
      const threshold = ((index + 1) / CURSE_THRESHOLDS.length) * stats.debtCap;
      if (stats.debt >= threshold && !this.activeCurses.has(curse.id)) {
        this.activeCurses.add(curse.id);
        this.emit('curseApplied', curse);
      }
      if (stats.debt < threshold && this.activeCurses.has(curse.id)) {
        this.activeCurses.delete(curse.id);
        this.emit('curseCleared', curse);
      }
    });

    if (this.activeCurses.has('hp_bleed')) {
      this.state.updateStat('hp', Math.max(0, stats.hp - delta / 500));
    }
  }

  increase(amount: number): void {
    const stats = this.state.getSaveData().stats;
    this.state.updateStat('debt', Math.min(stats.debtCap, stats.debt + amount));
  }

  reduce(amount: number): void {
    const stats = this.state.getSaveData().stats;
    this.state.updateStat('debt', Math.max(0, stats.debt - amount));
  }

  appease(amount: number): void {
    this.reduce(amount);
    const stats = this.state.getSaveData().stats;
    this.state.updateStat('lanternFuel', Math.max(0, stats.lanternFuel - amount));
  }

  getCurses(): DebtCurse[] {
    return CURSE_THRESHOLDS.filter((curse) => this.activeCurses.has(curse.id));
  }
}
