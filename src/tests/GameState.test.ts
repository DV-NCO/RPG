import { describe, expect, it } from 'vitest';

import GameState from '../core/state/GameState';

describe('GameState', () => {
  it('persists save data through save/load cycle', () => {
    const state = new GameState();
    state.newGame();
    state.setLocation('OverworldScene', 'town');
    state.addItem('fuel', 1);
    state.updateStat('debt', 40);
    state.save();

    const loaded = new GameState();
    const save = loaded.load();
    expect(save?.location.scene).toBe('OverworldScene');
    expect(save?.inventory.fuel).toBeGreaterThan(0);
    expect(save?.stats.debt).toBe(40);
  });
});
