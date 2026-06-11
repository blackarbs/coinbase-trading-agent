import type { GridLevel } from './builder.js';
import type { Settings } from '../config/env.js';
import type { Logger } from '../config/logger.js';

export type GridState = {
  levels: GridLevel[];
  active: boolean;
  fills: number;
};

export function isBreakout(price: number, s: Settings): boolean {
  const lowBreak = s.GRID_LOW * (1 - s.BREAKOUT_PCT / 100);
  const highBreak = s.GRID_HIGH * (1 + s.BREAKOUT_PCT / 100);
  return price < lowBreak || price > highBreak;
}

export function processPrice(state: GridState, price: number, s: Settings, log: Logger): GridState {
  if (!state.active) return state;

  const next = state.levels.map((l) => ({ ...l }));

  for (const level of next) {
    if (level.filled) continue;
    const hitBuy = level.side === 'buy' && price <= level.price;
    const hitSell = level.side === 'sell' && price >= level.price;
    if (!hitBuy && !hitSell) continue;

    level.filled = true;
    log.info('[sim] grid fill', { side: level.side, price: level.price, market: price });

    // Re-place opposite order one step up/down in the grid
    const idx = next.indexOf(level);
    if (level.side === 'buy' && idx + 1 < next.length) {
      next[idx + 1].side = 'sell';
      next[idx + 1].filled = false;
    } else if (level.side === 'sell' && idx - 1 >= 0) {
      next[idx - 1].side = 'buy';
      next[idx - 1].filled = false;
    }
  }

  return { ...state, levels: next, fills: state.fills + 1 };
}

export function haltGrid(state: GridState, reason: string, log: Logger): GridState {
  log.warn('grid halted', { reason, fills: state.fills });
  return { ...state, active: false };
}
