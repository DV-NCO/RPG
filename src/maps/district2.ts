import { MapDescriptor, Tile } from './tileset';

const width = 40;
const height = 22;

const baseLayer: number[][] = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => {
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      return Tile.Wall;
    }
    if (y % 6 === 0 && x > 4 && x < width - 4) {
      return Tile.Wall;
    }
    return Tile.Floor;
  }),
);

const decoLayer: number[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => Tile.Empty));

for (let y = 3; y < height - 3; y += 5) {
  decoLayer[y][6] = Tile.Light;
  decoLayer[y][32] = Tile.Light;
}

decoLayer[12][20] = Tile.Plate;
decoLayer[12][21] = Tile.Plate;

decoLayer[8][14] = Tile.Mirror;

decoLayer[16][26] = Tile.Gate;

const map: MapDescriptor = {
  name: 'Shuttered Garden',
  width,
  height,
  layers: [baseLayer, decoLayer],
  collisions: [Tile.Wall, Tile.Gate],
  lightSources: [
    { x: 6 * 8, y: 3 * 8, radius: 60, intensity: 0.6 },
    { x: 32 * 8, y: 8 * 8, radius: 80, intensity: 0.6 },
  ],
  enemies: [
    { type: 'nightborn', x: 18 * 8, y: 16 * 8 },
    { type: 'nightborn', x: 24 * 8, y: 6 * 8 },
  ],
  npcs: [],
  puzzles: [
    { type: 'pressure_plates', x: 20 * 8, y: 12 * 8, options: { gateX: 26 * 8, gateY: 16 * 8 } },
  ],
  exits: [
    { id: 'to_town', x: 4 * 8, y: 2 * 8, targetScene: 'OverworldScene', targetEntry: 'town' },
    { id: 'to_dungeon', x: 34 * 8, y: 20 * 8, targetScene: 'DungeonScene', targetEntry: 'lightworks' }
  ],
  spawn: {
    player: { x: 6 * 8, y: 4 * 8 },
    shadow: { x: 7 * 8, y: 4 * 8 },
  },
};

export default map;
