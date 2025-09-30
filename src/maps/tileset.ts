export const TILE_SIZE = 8;

export enum Tile {
  Empty = 0,
  Floor = 1,
  Wall = 2,
  Light = 3,
  Water = 4,
  Gate = 5,
  Plate = 6,
  Mirror = 7,
}

export interface MapDescriptor {
  name: string;
  width: number;
  height: number;
  layers: number[][][];
  collisions: number[];
  lightSources: { x: number; y: number; radius: number; intensity: number }[];
  enemies: { type: string; x: number; y: number }[];
  npcs: { id: string; x: number; y: number }[];
  puzzles: { type: string; x: number; y: number; options?: Record<string, unknown> }[];
  exits: { id: string; x: number; y: number; targetScene: string; targetEntry: string }[];
  spawn: { player: { x: number; y: number }; shadow: { x: number; y: number } };
}
