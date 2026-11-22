import { defineConfig } from 'drizzle-kit'

// drizzle-kit reads the models and writes the migration SQL into ./drizzle.
// Migrations are applied by `npm run db:migrate` (src/db/migrate.ts).
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_FILE ?? 'data/sallora.db' }, // used by `npm run db:studio`
  strict: true,
  verbose: true,
})
