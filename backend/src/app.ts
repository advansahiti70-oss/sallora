import { Hono } from 'hono'
import type { Sqlite } from './db/client.js'
import { healthRoute } from './routes/health.js'

/** Builds the API. Kept apart from index.ts so tests can call it without starting a server. */
export function createApp({ sqlite }: { sqlite: Sqlite }) {
  const app = new Hono()

  app.route('/', healthRoute(sqlite))

  app.notFound((c) => c.json({ error: 'not_found', hint: 'The only endpoint so far is GET /health' }, 404))
  app.onError((error, c) => {
    console.error(error)
    return c.json({ error: 'internal_error' }, 500)
  })

  return app
}
