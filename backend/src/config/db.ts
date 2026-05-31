import { Pool } from 'pg'

import {
  DATABASE_URL,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} from './constants'

// Prefer DATABASE_URL when present (Docker sets it), otherwise fall back to
// the individual POSTGRES_* vars for local non-Docker dev.
function poolConfig() {
  if (DATABASE_URL) return { connectionString: DATABASE_URL }

  if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
      'Set DATABASE_URL, or POSTGRES_HOST/USER/PASSWORD/DB.'
    )
  }
  return {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  }
}

export const pool = new Pool({
  ...poolConfig(),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (err) => {
  console.error('PostgreSQL pool error', err)
})
