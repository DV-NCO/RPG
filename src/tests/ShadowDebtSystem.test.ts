import { describe, expect, it, vi } from 'vitest';

import GameState from '../core/state/GameState';
import ShadowDebtSystem from '../systems/ShadowDebtSystem';

describe('ShadowDebtSystem', () => {
  it('applies and clears curses based on debt thresholds', () => {
    const state = new GameState();
    const system = new ShadowDebtSystem(state);
    const applied = vi.fn();
    const cleared = vi.fn();
    system.on('curseApplied', applied);
    system.on('curseCleared', cleared);

    system.increase(80);
    system.update(16);
    expect(applied).toHaveBeenCalled();

    system.reduce(80);
    system.update(16);
    expect(cleared).toHaveBeenCalled();
  });
});
