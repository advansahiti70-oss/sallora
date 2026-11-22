import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from '../config.js'
import * as schema from './schema.js'

export type Sqlite = Database.Database

/** Opens the SQLite file (or ':memory:' in tests) with the settings every connection needs. */
export function openDatabase(file: string = config.databaseFile) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const sqlite = new Database(file)
  sqlite.pragma('journal_mode = WAL') // the server can read while a script writes
  sqlite.pragma('foreign_keys = ON') // SQLite only checks the links between tables when asked
  sqlite.pragma('busy_timeout = 5000')
  const db = drizzle({ client: sqlite, schema })
  return { sqlite, db }
}

export type Db = ReturnType<typeof openDatabase>['db']

/** Applies every migration in backend/drizzle/ that has not run yet. */
export function migrateDatabase(db: Db) {
  migrate(db, { migrationsFolder: config.migrationsFolder })
}

/** Sallora's own tables, without SQLite's and Drizzle's bookkeeping tables. */
export function listTables(sqlite: Sqlite): string[] {
  return sqlite
    .prepare(
      `select name from sqlite_schema
       where type = 'table' and name not like 'sqlite\\_%' escape '\\' and name <> '__drizzle_migrations'
       order by name`,
    )
    .pluck()
    .all() as string[]
}

/** How many migrations have been applied (0 before the first `npm run db:migrate`). */
export function countMigrations(sqlite: Sqlite): number {
  const hasJournal = sqlite
    .prepare(`select 1 from sqlite_schema where type = 'table' and name = '__drizzle_migrations'`)
    .get()
  if (!hasJournal) return 0
  return sqlite.prepare('select count(*) from __drizzle_migrations').pluck().get() as number
}
