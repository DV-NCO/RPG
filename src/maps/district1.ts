import { MapDescriptor, Tile } from './tileset';

const width = 40;
const height = 22;

const baseLayer: number[][] = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => {
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      return Tile.Wall;
    }
    if (x % 8 === 0 && y > 2 && y < height - 3) {
      return Tile.Wall;
    }
    return Tile.Floor;
  }),
);

const decoLayer: number[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => Tile.Empty));

for (let x = 4; x < width - 4; x += 6) {
  decoLayer[4][x] = Tile.Light;
}

for (let x = 6; x < width - 6; x += 5) {
  decoLayer[14][x] = Tile.Mirror;
}

const map: MapDescriptor = {
  name: 'Warehouse Row',
  width,
  height,
  layers: [baseLayer, decoLayer],
  collisions: [Tile.Wall],
  lightSources: [
    { x: 4 * 8, y: 4 * 8, radius: 80, intensity: 0.9 },
    { x: 20 * 8, y: 4 * 8, radius: 70, intensity: 0.7 },
    { x: 32 * 8, y: 14 * 8, radius: 70, intensity: 0.7 },
  ],
  enemies: [
    { type: 'lightborn', x: 10 * 8, y: 12 * 8 },
    { type: 'lightborn', x: 26 * 8, y: 8 * 8 },
  ],
  npcs: [],
  puzzles: [
    { type: 'mirror_corridor', x: 20 * 8, y: 12 * 8 },
  ],
  exits: [
    { id: 'to_town', x: 2 * 8, y: 2 * 8, targetScene: 'OverworldScene', targetEntry: 'town' },
    { id: 'to_dungeon', x: 38 * 8, y: 20 * 8, targetScene: 'DungeonScene', targetEntry: 'lightworks' }
  ],
  spawn: {
    player: { x: 4 * 8, y: 4 * 8 },
    shadow: { x: 5 * 8, y: 4 * 8 },
  },
};

export default map;
