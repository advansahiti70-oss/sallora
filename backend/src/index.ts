import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { config } from './config.js'
import { countMigrations, openDatabase } from './db/client.js'

const { sqlite } = openDatabase()
const app = createApp({ sqlite })

const server = serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(`Sallora API: http://localhost:${info.port}  ·  health check: http://localhost:${info.port}/health`)
  if (countMigrations(sqlite) === 0) {
    console.warn('The database has no tables yet. Run: npm run db:migrate')
  }
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Stop the other app, or set API_PORT in backend/.env.`)
    process.exit(1)
  }
  throw error
})

// Close the database cleanly on Ctrl+C, and when `tsx watch` restarts the server.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close()
    sqlite.close()
    process.exit(0)
  })
}
