import assert from 'node:assert/strict'
import { beforeEach, describe, test } from 'node:test'
import { eq } from 'drizzle-orm'
import { migrateDatabase, openDatabase, type Db, type Sqlite } from '../src/db/client.js'
import { alerts, diningTables, tableEvents, venues } from '../src/db/schema.js'

let sqlite: Sqlite
let db: Db

beforeEach(() => {
  ;({ sqlite, db } = openDatabase(':memory:'))
  migrateDatabase(db)
})

const addVenue = (values: Partial<typeof venues.$inferInsert> = {}) =>
  db.insert(venues).values({ name: 'Test café', city: 'Prishtina', country: 'XK', ...values }).returning().get()

const columnsOf = (table: string) =>
  sqlite.prepare('select name from pragma_table_info(?)').pluck().all(table) as string[]

describe('data model rules', () => {
  test('BR-09 / BR-10: a venue starts at 5 and 3 minutes', () => {
    const venue = addVenue()
    assert.equal(venue.waitingThresholdMin, 5)
    assert.equal(venue.clearingThresholdMin, 3)
    assert.equal(venue.status, 'setup')
  })

  test('BR-09: the waiting threshold must stay between 2 and 15 minutes', () => {
    assert.throws(() => addVenue({ waitingThresholdMin: 20 }), /CHECK constraint failed/)
    assert.throws(() => addVenue({ waitingThresholdMin: 1 }), /CHECK constraint failed/)
    assert.doesNotThrow(() => addVenue({ waitingThresholdMin: 15 }))
  })

  test('BR-10: the clearing threshold must stay between 1 and 10 minutes', () => {
    assert.throws(() => addVenue({ clearingThresholdMin: 11 }), /CHECK constraint failed/)
  })

  test('BR-01: a table event holds the table, state, time and people count, nothing else', () => {
    assert.deepEqual(columnsOf('table_events').sort(), [
      'id',
      'kind',
      'occurred_at',
      'people_count',
      'source',
      'state',
      'table_id',
      'venue_id',
    ])
  })

  test('BR-06: alerts keep when and how they were answered, never who', () => {
    const columns = columnsOf('alerts')
    assert.ok(columns.includes('resolved_at'))
    assert.ok(!columns.some((name) => /user|staff|waiter|by$/.test(name)), columns.join(', '))
  })

  test('BR-22: deleting a venue deletes its tables, events and alerts', () => {
    const venue = addVenue()
    const table = db.insert(diningTables).values({ venueId: venue.id, number: 4 }).returning().get()
    db.insert(tableEvents)
      .values({ venueId: venue.id, tableId: table.id, kind: 'state', state: 'seated', source: 'box', occurredAt: new Date() })
      .run()
    db.insert(alerts).values({ venueId: venue.id, tableId: table.id, kind: 'waiting' }).run()

    db.delete(venues).where(eq(venues.id, venue.id)).run()

    assert.equal(db.select().from(diningTables).all().length, 0)
    assert.equal(db.select().from(tableEvents).all().length, 0)
    assert.equal(db.select().from(alerts).all().length, 0)
  })

  test('a state event needs a state, and a visit has none', () => {
    const venue = addVenue()
    const table = db.insert(diningTables).values({ venueId: venue.id, number: 7 }).returning().get()
    const event = { venueId: venue.id, tableId: table.id, source: 'box' as const, occurredAt: new Date() }
    assert.throws(() => db.insert(tableEvents).values({ ...event, kind: 'state' }).run(), /CHECK constraint failed/)
    assert.throws(
      () => db.insert(tableEvents).values({ ...event, kind: 'visit', state: 'free' }).run(),
      /CHECK constraint failed/,
    )
    assert.doesNotThrow(() => db.insert(tableEvents).values({ ...event, kind: 'visit' }).run())
  })

  test('the setup window lasts at most 72 hours', () => {
    const venue = addVenue()
    const start = 1_800_000_000
    assert.throws(
      () =>
        sqlite
          .prepare("insert into access_windows (venue_id, kind, starts_at, ends_at) values (?, 'setup', ?, ?)")
          .run(venue.id, start, start + 73 * 3600),
      /CHECK constraint failed/,
    )
  })
})
