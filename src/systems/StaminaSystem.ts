import GameState from '../core/state/GameState';

export default class StaminaSystem {
  private regenRate = 8;

  constructor(private readonly state: GameState) {}

  update(delta: number): void {
    const stats = this.state.getSaveData().stats;
    if (stats.stamina < 100) {
      const regen = (delta / 1000) * this.regenRate * (1 - stats.debt / Math.max(1, stats.debtCap));
      this.state.updateStat('stamina', Math.min(100, stats.stamina + regen));
    }
  }
}
