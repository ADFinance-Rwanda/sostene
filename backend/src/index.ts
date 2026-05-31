import fs from 'fs'
import path from 'path'

// `./config/constants` imports `dotenv/config`, so it must run before any
// other module that touches process.env. Keep this import first.
import { NODE_ENV, PORT } from './config/constants'
import app from './app'
import { pool } from './config/db'
import { connectRedis } from './config/redis'

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

// Runs every *.sql file in backend/migrations/, sorted, each in its own
// transaction. Migrations use `IF NOT EXISTS` so re-runs are idempotent.
async function runMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`Migrations directory not found: ${MIGRATIONS_DIR}`)
    return
  }

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`Running migration: ${file}`)

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

async function main() {
  try {
    await runMigrations()
    await connectRedis()
    app.listen(PORT, () => {
      console.log(`Task Manager API running on http://localhost:${PORT} (${NODE_ENV})`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

main()
