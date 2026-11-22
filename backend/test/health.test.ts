import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { createApp } from '../src/app.js'
import { migrateDatabase, openDatabase } from '../src/db/client.js'
import type { HealthResponse } from '../src/routes/health.js'

describe('GET /health', () => {
  test('answers 200 with the tables once the first migration has run', async () => {
    const { sqlite, db } = openDatabase(':memory:')
    migrateDatabase(db)

    const res = await createApp({ sqlite }).request('/health')
    const body = (await res.json()) as HealthResponse

    assert.equal(res.status, 200)
    assert.equal(body.status, 'ok')
    assert.equal(body.database.status, 'ok')
    if (body.database.status === 'ok') {
      assert.equal(body.database.migrations, 1)
      assert.equal(body.database.tables.length, 23)
      assert.ok(body.database.tables.includes('dining_tables'))
    }
  })

  test('answers 503 and says what to run when the database has no tables yet', async () => {
    const { sqlite } = openDatabase(':memory:')

    const res = await createApp({ sqlite }).request('/health')
    const body = (await res.json()) as HealthResponse

    assert.equal(res.status, 503)
    assert.deepEqual(body.database, { status: 'not_migrated', hint: 'Run: npm run db:migrate' })
  })

  test('any other path is a JSON 404, because there are no other endpoints yet', async () => {
    const { sqlite } = openDatabase(':memory:')
    const res = await createApp({ sqlite }).request('/api/tables')
    assert.equal(res.status, 404)
  })
})
