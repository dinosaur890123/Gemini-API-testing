import { Pool } from 'pg';

let pool: Pool | undefined;

if (process.env.POSTGRES_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

export async function query(text: string, params?: unknown[]) {
  if (!pool) {
    console.warn("Database not connected (POSTGRES_URL missing). Using in-memory fallback.");
    return null;
  }
  return pool.query(text, params);
}
