import { Hono } from 'hono'
import { countMigrations, listTables, type Sqlite } from '../db/client.js'

export type HealthResponse = {
  status: 'ok' | 'error'
  service: 'sallora-backend'
  time: string
  database:
    | { status: 'ok'; migrations: number; tables: string[] }
    | { status: 'not_migrated'; hint: string }
    | { status: 'error'; message: string }
}

/** GET /health: is the API up, and does the database have its tables? 200 if yes, 503 if not. */
export function healthRoute(sqlite: Sqlite) {
  return new Hono().get('/health', (c) => {
    const base = { service: 'sallora-backend', time: new Date().toISOString() } as const
    try {
      const migrations = countMigrations(sqlite)
      const tables = listTables(sqlite)
      if (migrations === 0 || tables.length === 0) {
        const body: HealthResponse = {
          status: 'error',
          ...base,
          database: { status: 'not_migrated', hint: 'Run: npm run db:migrate' },
        }
        return c.json(body, 503)
      }
      const body: HealthResponse = { status: 'ok', ...base, database: { status: 'ok', migrations, tables } }
      return c.json(body)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const body: HealthResponse = { status: 'error', ...base, database: { status: 'error', message } }
      return c.json(body, 503)
    }
  })
}
