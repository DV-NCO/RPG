import { MapDescriptor, Tile } from './tileset';

const width = 40;
const height = 22;

const baseLayer: number[][] = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => {
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      return Tile.Wall;
    }
    if (y === Math.floor(height / 2) && x > 6 && x < width - 6) {
      return Tile.Water;
    }
    return Tile.Floor;
  }),
);

const decoLayer: number[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => Tile.Empty));

for (let x = 6; x < width - 6; x += 8) {
  decoLayer[4][x] = Tile.Light;
  decoLayer[height - 5][x] = Tile.Mirror;
}

const map: MapDescriptor = {
  name: 'Lamp Warden Sanctum',
  width,
  height,
  layers: [baseLayer, decoLayer],
  collisions: [Tile.Wall, Tile.Water],
  lightSources: [
    { x: 10 * 8, y: 4 * 8, radius: 80, intensity: 0.9 },
    { x: 30 * 8, y: 4 * 8, radius: 80, intensity: 0.9 },
  ],
  enemies: [
    { type: 'boss', x: 20 * 8, y: 10 * 8 }
  ],
  npcs: [
    { id: 'warden', x: 20 * 8, y: 10 * 8 }
  ],
  puzzles: [
    { type: 'rotating_lamp', x: 20 * 8, y: 4 * 8 }
  ],
  exits: [
    { id: 'to_dungeon', x: 20 * 8, y: 20 * 8, targetScene: 'DungeonScene', targetEntry: 'entrance' }
  ],
  spawn: {
    player: { x: 12 * 8, y: 18 * 8 },
    shadow: { x: 14 * 8, y: 18 * 8 },
  },
};

export default map;
