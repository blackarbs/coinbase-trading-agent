import type { Settings } from '../config/env.js';

export type GridLevel = {
  price: number;
  side: 'buy' | 'sell';
  filled: boolean;
};

export function buildGrid(s: Settings): GridLevel[] {
  if (s.GRID_HIGH <= s.GRID_LOW) throw new Error('GRID_HIGH must exceed GRID_LOW');
  const step = (s.GRID_HIGH - s.GRID_LOW) / (s.GRID_LEVELS - 1);
  const levels: GridLevel[] = [];
  for (let i = 0; i < s.GRID_LEVELS; i++) {
    const price = Math.round((s.GRID_LOW + step * i) * 100) / 100;
    levels.push({ price, side: 'buy', filled: false });
  }
  return levels;
}
