import { MapDescriptor, Tile } from './tileset';

const width = 40;
const height = 22;

const baseLayer: number[][] = Array.from({ length: height }, (_, y) =>
  Array.from({ length: width }, (_, x) => {
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      return Tile.Wall;
    }
    if (y === 10 && x > 6 && x < 33) {
      return Tile.Water;
    }
    return Tile.Floor;
  }),
);

const decoLayer: number[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => Tile.Empty));

decoLayer[5][8] = Tile.Light;
decoLayer[16][30] = Tile.Light;
decoLayer[14][4] = Tile.Mirror;

decoLayer[8][20] = Tile.Plate;

const map: MapDescriptor = {
  name: 'Emberwatch Plaza',
  width,
  height,
  layers: [baseLayer, decoLayer],
  collisions: [Tile.Wall, Tile.Water],
  lightSources: [
    { x: 8 * 8, y: 5 * 8, radius: 60, intensity: 0.8 },
    { x: 30 * 8, y: 16 * 8, radius: 60, intensity: 0.7 },
  ],
  enemies: [],
  npcs: [
    { id: 'elder', x: 12 * 8, y: 12 * 8 },
    { id: 'smith', x: 24 * 8, y: 14 * 8 },
    { id: 'scribe', x: 30 * 8, y: 6 * 8 },
    { id: 'runner', x: 16 * 8, y: 6 * 8 },
  ],
  puzzles: [
    { type: 'shrine', x: 6 * 8, y: 16 * 8 },
  ],
  exits: [
    { id: 'to_district1', x: 2 * 8, y: 2 * 8, targetScene: 'OverworldScene', targetEntry: 'district1' },
    { id: 'to_district2', x: 34 * 8, y: 2 * 8, targetScene: 'OverworldScene', targetEntry: 'district2' },
    { id: 'to_dungeon', x: 20 * 8, y: 20 * 8, targetScene: 'DungeonScene', targetEntry: 'entrance' }
  ],
  spawn: {
    player: { x: 20 * 8, y: 12 * 8 },
    shadow: { x: 18 * 8, y: 12 * 8 },
  },
};

export default map;
