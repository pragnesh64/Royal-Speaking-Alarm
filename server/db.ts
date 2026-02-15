import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeon = (process.env.DATABASE_URL || '').includes('neon.tech');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool sizing
  max: 10,                        // max connections in pool
  min: 2,                         // keep 2 warm connections ready
  // Timeouts
  idleTimeoutMillis: 30000,       // close idle connections after 30s
  connectionTimeoutMillis: 10000, // fail fast if can't connect in 10s
  // Keep connections warm (critical for remote DBs like Neon)
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // SSL required for Neon and most cloud DBs
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});

// CRITICAL: Handle pool errors to prevent unhandled 'error' event crashes
pool.on('error', (err) => {
  console.error('[DB] Pool connection error (non-fatal):', err.message);
  // Don't crash — the pool will automatically reconnect on next query
});

// Pre-warm the pool by establishing a connection immediately
pool.query('SELECT 1').then(() => {
  console.log('[DB] Connection pool warmed up');
}).catch((err) => {
  console.error('[DB] Pool warm-up failed:', err.message);
});

export const db = drizzle(pool, { schema });
