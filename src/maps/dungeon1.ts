import { MapDescriptor, Tile } from './tileset';

const width = 40;
const height = 22;

const baseLayer: number[][] = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => {
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      return Tile.Wall;
    }
    if ((x > 6 && x < 12 && y > 4 && y < 10) || (x > 26 && x < 34 && y > 12 && y < 18)) {
      return Tile.Wall;
    }
    return Tile.Floor;
  }),
);

const decoLayer: number[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => Tile.Empty));

decoLayer[6][12] = Tile.Light;
decoLayer[12][8] = Tile.Light;
decoLayer[16][20] = Tile.Light;

decoLayer[4][20] = Tile.Plate;
decoLayer[6][22] = Tile.Plate;
decoLayer[8][24] = Tile.Plate;

decoLayer[10][28] = Tile.Mirror;

decoLayer[14][30] = Tile.Gate;

const map: MapDescriptor = {
  name: 'Lightworks Approach',
  width,
  height,
  layers: [baseLayer, decoLayer],
  collisions: [Tile.Wall, Tile.Gate],
  lightSources: [
    { x: 12 * 8, y: 6 * 8, radius: 60, intensity: 0.8 },
    { x: 8 * 8, y: 12 * 8, radius: 70, intensity: 0.7 },
    { x: 20 * 8, y: 16 * 8, radius: 90, intensity: 0.9 },
  ],
  enemies: [
    { type: 'lightborn', x: 16 * 8, y: 6 * 8 },
    { type: 'nightborn', x: 24 * 8, y: 14 * 8 },
  ],
  npcs: [
    { id: 'shadow', x: 10 * 8, y: 18 * 8 }
  ],
  puzzles: [
    { type: 'shadow_maze', x: 24 * 8, y: 14 * 8 },
  ],
  exits: [
    { id: 'to_town', x: 2 * 8, y: 2 * 8, targetScene: 'OverworldScene', targetEntry: 'town' },
    { id: 'to_boss', x: 36 * 8, y: 18 * 8, targetScene: 'BossScene', targetEntry: 'arena' }
  ],
  spawn: {
    player: { x: 6 * 8, y: 6 * 8 },
    shadow: { x: 8 * 8, y: 6 * 8 },
  },
};

export default map;
