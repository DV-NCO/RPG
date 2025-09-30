# Shadow Pact — Dual-Being Action RPG (Vertical Slice)

Shadow Pact is a retro-inspired action RPG built with Phaser 3 and TypeScript. Control both the lantern-bearing hero and their autonomous shadow across a compact 10–20 hour concept, delivered here as a 6–10 hour vertical slice. Swap between forms, juggle light and darkness, and manage a growing Shadow Debt while solving spatial-light puzzles and toppling the Warden of the Lamp.

## Getting Started

```bash
npm install
npm run dev
```

The Vite dev server serves the game at `http://localhost:5173/`. The build output is available via `npm run build`, and `npm run preview` serves the production bundle.

### Scripts

- `npm run dev` — Start Vite in development mode.
- `npm run build` — Produce a production bundle.
- `npm run preview` — Preview the production build locally.
- `npm run lint` — Run ESLint with Prettier integration.
- `npm run typecheck` — TypeScript strict mode compile check.
- `npm run test` — Execute Vitest unit tests.

## Controls

| Action            | Keyboard / Mouse                 | Gamepad                 |
| ----------------- | -------------------------------- | ----------------------- |
| Move              | WASD / Arrow keys                | Left stick              |
| Dash              | Left Shift                       | B / Circle              |
| Attack            | Space                            | A / Cross               |
| Interact          | E                                | X / Square              |
| Swap Player/Shadow| Q                                | Y / Triangle            |
| Lantern Toggle    | F (aim with mouse)               | RT / LT                 |
| Shadow Ability    | R                                | RB / LB                 |
| Inventory         | Tab                              | View/Select             |
| Pause             | Esc                              | Start                   |

## Gameplay Loop

1. **Title → Tutorial:** Start from the Title scene to the Emberwatch plaza tutorial. Learn to swap forms, interact with NPCs, and appease the Shadow Debt.
2. **Town Hub:** Shop, unlock quests, accept optional appeasement tasks, and access Districts.
3. **Districts:** Solve light-manipulation puzzles (mirror corridor, pressure plates) while countering Lightborn and Nightborn foes whose strengths invert with lighting.
4. **Dungeon & Boss:** Navigate the Lightworks shadow maze, then defeat the Warden of the Lamp whose phases force lamp rotation and mirror alignment.

Shadow Debt trades immediate power for long-term curses. Appease it via shrine fuel sacrifices or optional objectives.

## Adding New Maps or Puzzles

1. Create a new map descriptor under `src/maps/` by exporting a `MapDescriptor`. Use `TILE_SIZE` for consistent scaling and populate `layers`, `lightSources`, and entity spawn lists.
2. Register the map in the desired scene (e.g., add to `MAPS` in `OverworldScene` or `DungeonScene`). Provide exits pointing to target scenes/entries.
3. For new puzzles, extend `src/systems/PuzzlePieces.ts` or add bespoke puzzle handlers to the scene. Emit HUD quest updates via `this.game.events.emit('hud:quests', lines)`.
4. Update `src/data` for NPC dialogue, quest objectives, or items tied to the new area.

## Testing

```bash
npm run test
```

Vitest covers Shadow Debt scaling, dialogue branching, and save/load persistence. Add new tests under `src/tests/` to ensure deterministic systems.

## Accessibility & Options

- HUD includes HP, Stamina, Shadow Debt, lantern fuel, and a quest tracker.
- Toggle pause with `Esc` to reference controls and inventory tips.
- Switch between the default NES palette and alternative palettes inside the code (see `src/styles/palette.ts`).

## Credits

- Phaser 3 + TypeScript + Vite scaffold.
- Placeholder pixel art and audio generated in-code via base64 assets.

