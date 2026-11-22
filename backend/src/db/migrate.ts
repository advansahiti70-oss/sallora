/**
 * `npm run db:migrate`: creates backend/data/sallora.db if needed, applies the migrations in
 * backend/drizzle/, then prints the tables so you can see what is in the database.
 */
import { readFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { backendRoot, config } from '../config.js'
import { countMigrations, listTables, migrateDatabase, openDatabase } from './client.js'

const { db, sqlite } = openDatabase()
const before = countMigrations(sqlite)
migrateDatabase(db)
const after = countMigrations(sqlite)

const journal = JSON.parse(readFileSync(resolve(config.migrationsFolder, 'meta/_journal.json'), 'utf8')) as {
  entries: { tag: string }[]
}
const tables = listTables(sqlite)
const columnCount = sqlite.prepare('select count(*) from pragma_table_info(?)').pluck()
const repoRoot = resolve(backendRoot, '..')

console.log(`\nDatabase: ${relative(repoRoot, config.databaseFile).split(sep).join('/')}`)
console.log(
  after > before
    ? `Applied ${after - before} new migration(s): ${journal.entries.slice(before).map((e) => e.tag).join(', ')}`
    : `Up to date: ${after} migration(s) already applied (${journal.entries.map((e) => e.tag).join(', ')})`,
)
console.log(`\n${tables.length} tables:`)
for (const table of tables) console.log(`  ${table.padEnd(20)} ${columnCount.get(table)} columns`)
console.log('\nNext: npm run dev, then open http://localhost:3000/health\n')

sqlite.close()
