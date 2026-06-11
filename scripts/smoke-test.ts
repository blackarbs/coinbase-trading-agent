import { buildGrid } from '../src/grid/builder.js';
import { isBreakout, processPrice } from '../src/grid/manager.js';

const s = {
  GRID_LOW: 58000,
  GRID_HIGH: 62000,
  GRID_LEVELS: 5,
  ORDER_SIZE: 0.001,
  BREAKOUT_PCT: 2,
};

const levels = buildGrid(s);
if (levels.length !== 5) throw new Error('grid size');
if (!isBreakout(56500, s)) throw new Error('breakout low');

const log = { info() {}, warn() {}, error() {} };
let state = { levels, active: true, fills: 0 };
state = processPrice(state, levels[0].price, s, log);
console.log('smoke-test: grid engine OK');
