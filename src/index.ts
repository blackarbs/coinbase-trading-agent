import { settings } from './config/env.js';
import { createLogger } from './config/logger.js';
import { closeRedisClient, isRedisEnabled, pingRedis } from './cache/redis.js';
import { cacheGet, cacheSet } from './cache/store.js';
import { buildGrid } from './grid/builder.js';
import { haltGrid, isBreakout, processPrice, type GridState } from './grid/manager.js';
import { fetchMidPrice } from './price/ticker.js';

const log = createLogger();

let state: GridState = {
  levels: buildGrid(settings),
  active: true,
  fills: 0,
};

async function loadGrid(): Promise<void> {
  const raw = await cacheGet('grid-state');
  if (!raw) return;
  try {
    state = JSON.parse(raw) as GridState;
  } catch {
    log.warn('ignored corrupt grid-state cache');
  }
}

async function saveGrid(): Promise<void> {
  await cacheSet('grid-state', JSON.stringify(state), 86_400);
}

async function tick() {
  const price = await fetchMidPrice(settings.PRODUCT_ID);

  if (state.active && isBreakout(price, settings)) {
    state = haltGrid(state, `breakout at ${price}`, log);
    await saveGrid();
    return;
  }

  const before = state.fills;
  state = processPrice(state, price, settings, log);
  if (state.fills !== before) await saveGrid();
}

async function bootstrap() {
  if (isRedisEnabled()) {
    const ok = await pingRedis();
    log[ok ? 'info' : 'warn'](ok ? 'Redis cache connected' : 'Redis unreachable — using in-memory cache');
  } else {
    log.info('Redis cache disabled — using in-memory cache');
  }

  await loadGrid();

  log.info('Grid trading agent started', {
    simulation: settings.SIMULATION_MODE,
    range: [settings.GRID_LOW, settings.GRID_HIGH],
    levels: settings.GRID_LEVELS,
    restoredFills: state.fills,
  });

  const loop = setInterval(() => {
    tick().catch((e) => log.error('tick failed', { err: String(e) }));
  }, settings.POLL_INTERVAL_MS);

  const stop = () => {
    clearInterval(loop);
    void saveGrid()
      .catch(() => undefined)
      .then(() => closeRedisClient())
      .catch(() => undefined)
      .finally(() => {
        log.info('stopped', { fills: state.fills, active: state.active });
        process.exit(0);
      });
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

bootstrap().catch((err) => {
  log.error('Fatal', { err: String(err) });
  void closeRedisClient().finally(() => process.exit(1));
});
