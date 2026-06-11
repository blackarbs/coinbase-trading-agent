import { config } from 'dotenv';
import { z } from 'zod';

config();

const schema = z.object({
  SIMULATION_MODE: z.string().default('true').transform((v) => v.toLowerCase() === 'true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  POLL_INTERVAL_MS: z.coerce.number().min(1000).default(3000),
  COINBASE_API_KEY: z.string().default(''),
  COINBASE_API_SECRET: z.string().default(''),
  PRODUCT_ID: z.string().default('BTC-USD'),
  GRID_LOW: z.coerce.number().positive().default(58000),
  GRID_HIGH: z.coerce.number().positive().default(62000),
  GRID_LEVELS: z.coerce.number().min(2).max(50).default(10),
  ORDER_SIZE: z.coerce.number().positive().default(0.001),
  BREAKOUT_PCT: z.coerce.number().min(0.5).default(2),
});

export type Settings = z.infer<typeof schema>;
export const settings = schema.parse(process.env);
