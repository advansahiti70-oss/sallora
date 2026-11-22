/**
 * `npm run db:diagram`: draws the data model from schema.ts, so the picture always shows the same
 * model as the code. It writes two files:
 * - docs/data-model.svg: the picture shown in docs/data-model.md
 * - docs/data-model.dbml: the same model in DBML; paste it into https://dbdiagram.io to explore it
 */
import { getTableName, is } from 'drizzle-orm'
import { getTableConfig, SQLiteTable, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { writeFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { backendRoot } from '../config.js'
import { renderSvg, type GroupLayout, type LinkInfo, type TableInfo } from './diagram-svg.js'
import * as schema from './schema.js'

/** The five areas of docs/data-model.md, and where they sit in the picture. Every table must be in one. */
const LAYOUT: GroupLayout[] = [
  { title: 'Venue and people', column: 0, tables: ['venues', 'users', 'venue_members', 'invites', 'consents', 'access_windows'] },
  { title: 'Devices and floor map', column: 1, tables: ['boxes', 'cameras', 'snapshots', 'zones', 'dining_tables', 'sections'] },
  {
    title: 'Service',
    column: 2,
    tables: ['outages', 'table_events', 'alerts', 'shifts', 'shift_assignments', 'service_hours', 'push_subscriptions'],
  },
  { title: 'Reports and AI', column: 3, tables: ['reports', 'questions'] },
  { title: 'Billing', column: 3, tables: ['subscriptions', 'invoices'] },
]

const TYPES: Record<string, string> = {
  SQLiteInteger: 'integer',
  SQLiteTimestamp: 'timestamp',
  SQLiteBoolean: 'boolean',
  SQLiteText: 'text',
  SQLiteTextJson: 'json',
  SQLiteReal: 'real',
}

const order = LAYOUT.flatMap((group) => group.tables)
const drizzleTables = (Object.values(schema) as unknown[])
  .filter((value): value is SQLiteTable => is(value, SQLiteTable))
  .sort((a, b) => order.indexOf(getTableName(a)) - order.indexOf(getTableName(b)))

const missing = drizzleTables.map((table) => getTableName(table)).filter((name) => !order.includes(name))
if (missing.length > 0) throw new Error(`Add these tables to LAYOUT in diagram.ts: ${missing.join(', ')}`)

const typeOf = (column: AnySQLiteColumn) => TYPES[column.columnType] ?? column.getSQLType()

// ---------------------------------------------------------------------------
// Read the model once
// ---------------------------------------------------------------------------

const tables: TableInfo[] = []
const links: (LinkInfo & { oneToOne: boolean; onDelete?: string })[] = []
const dbmlBlocks: string[] = []

for (const table of drizzleTables) {
  const config = getTableConfig(table)
  const fkColumns = new Set(config.foreignKeys.map((fk) => fk.reference().columns[0]!.name))

  tables.push({
    name: config.name,
    columns: config.columns.map((column) => ({
      name: column.name,
      type: typeOf(column),
      pk: column.primary,
      fk: fkColumns.has(column.name),
    })),
  })

  for (const foreignKey of config.foreignKeys) {
    const { columns, foreignColumns, foreignTable } = foreignKey.reference()
    links.push({
      from: config.name,
      fromColumn: columns[0]!.name,
      to: getTableName(foreignTable),
      toColumn: foreignColumns[0]!.name,
      oneToOne: columns[0]!.isUnique,
      onDelete: foreignKey.onDelete,
    })
  }

  // DBML for this table
  const lines = config.columns.map((column) => {
    const settings: string[] = []
    if (column.primary) settings.push('pk')
    else if (column.notNull) settings.push('not null')
    if (column.isUnique) settings.push('unique')
    if (column.hasDefault && column.default !== undefined) {
      const value: unknown = column.default
      if (typeof value === 'number' || typeof value === 'boolean') settings.push(`default: ${value}`)
      else if (typeof value === 'string') settings.push(`default: '${value}'`)
      else settings.push('default: `now`') // the only SQL default in the schema is (unixepoch())
    }
    if (column.enumValues?.length) settings.push(`note: '${column.enumValues.join(' | ')}'`)
    return `  ${column.name} ${typeOf(column)}${settings.length ? ` [${settings.join(', ')}]` : ''}`
  })
  const uniqueIndexes = config.indexes.filter((index) => index.config.unique && index.config.columns.length > 1)
  if (uniqueIndexes.length > 0) {
    lines.push('', '  indexes {')
    for (const index of uniqueIndexes) {
      const names = index.config.columns.map((column) => ('name' in column ? column.name : '?'))
      lines.push(`    (${names.join(', ')}) [unique]`)
    }
    lines.push('  }')
  }
  dbmlBlocks.push(`Table ${config.name} {\n${lines.join('\n')}\n}`)
}

// ---------------------------------------------------------------------------
// Write the DBML and the SVG
// ---------------------------------------------------------------------------

const refs = links.map((link) => {
  const arrow = link.oneToOne ? '-' : '>' // one-to-one when the link column is unique
  const onDelete = link.onDelete && link.onDelete !== 'no action' ? ` [delete: ${link.onDelete}]` : ''
  return `Ref: ${link.from}.${link.fromColumn} ${arrow} ${link.to}.${link.toColumn}${onDelete}`
})
const groups = LAYOUT.map(
  (group) =>
    `TableGroup ${group.title.toLowerCase().replace(/\W+/g, '_')} {\n${group.tables.map((name) => `  ${name}`).join('\n')}\n}`,
)
const dbml = [
  '// Sallora data model (v1). Generated from backend/src/db/schema.ts by `npm run db:diagram`. Do not edit by hand.\n' +
    '// Paste this file into https://dbdiagram.io to see the diagram and move the tables around.',
  `Project sallora {\n  database_type: 'SQLite'\n}`,
  ...dbmlBlocks,
  refs.join('\n'),
  ...groups,
].join('\n\n')

const repoRoot = resolve(backendRoot, '..')
const shown = (file: string) => relative(repoRoot, file).split(sep).join('/')

const dbmlFile = resolve(repoRoot, 'docs', 'data-model.dbml')
writeFileSync(dbmlFile, `${dbml}\n`)
const svgFile = resolve(repoRoot, 'docs', 'data-model.svg')
writeFileSync(svgFile, `${renderSvg(tables, links, LAYOUT)}\n`)

console.log(`Wrote ${shown(svgFile)} and ${shown(dbmlFile)}: ${tables.length} tables, ${links.length} links`)
