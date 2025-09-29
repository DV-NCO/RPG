# RPG EX

## Fundamental Enhancements Overview
The game client now ships with injectable examples that demonstrate how each gameplay fundamental can be extended directly inside `RPG.exe`.

### Progression & Rest Cycles
- New constants (`RESTED_XP_MAX`, `RESTED_XP_PER_HOUR`, etc.) and helpers (`ensureFundamentalState`, `applyFundamentalEnhancements`) automatically seed save files with a rested experience pool and regenerate it hourly.
- `applyXP` consumes the rested pool and surfaces bonus messaging, while `renderHub` exposes rested totals and momentum at a glance.
- Example hook: drop `applyFundamentalEnhancements` into any bootstrap path to guarantee that migrated saves pick up the rested system without manual intervention.

### Combat Identity Upgrades
- `ABILITY_LIBRARY` now includes class-specific injections (`rupture`, `astralNova`, `rainOfArrows`) and their respective class loadouts were updated in `CLASS_DEFS`.
- `doPlayerAction` contains turnkey logic to wire elite-sensitive or status-aware bonuses without touching the battle loop contract.
- Example hook: append additional `abilityClone` calls inside `applyFundamentalEnhancements` to distribute bespoke skills per class.

### Economy & Shop Flow
- `stockShop(state)` accepts the active state, attaches featured inventory rotations, and relies on the new `momentumDraught` consumable blueprint.
- Featured stock is surfaced through a lightweight badge style so UI changes remain encapsulated to the shop template.
- Example hook: reuse the featured-stock branch to schedule rotating legendary gear, or expand the consumable table to introduce new crafting resources.

### World Momentum & Elite Tracks
- `startBattle` and `makeEnemy` cooperate to generate elite encounters once momentum thresholds (tracked in `world.fundamentals`) are met.
- `endBattle` handles streak accounting, elite-ready priming, and reward inflation before piping through `applyRewards`.
- Example hook: extend `fundamentals.momentumBonus` math or attach additional fields (e.g., dungeon modifiers) inside `ensureFundamentalState` to diversify world scaling.

These snippets illustrate how each core pillar—progression, combat, economy, and world flow—can be enhanced by injecting the provided code into the shipping `RPG.exe` bundle.
