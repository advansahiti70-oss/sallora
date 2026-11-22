import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/** The backend folder, whether the code runs from src/ (tsx) or dist/ (node). */
export const backendRoot = resolve(import.meta.dirname, '..')

// Optional backend/.env (copy .env.example). Secrets go there, never into git.
const envFile = resolve(backendRoot, '.env')
if (existsSync(envFile)) process.loadEnvFile(envFile)

export const config = {
  // API_PORT, not PORT: tools often set PORT for the front end, and the two servers must not collide.
  port: Number(process.env.API_PORT ?? 3000),
  // localhost only: nothing outside this computer can reach the dev server, and Windows shows no firewall popup.
  host: process.env.API_HOST ?? 'localhost',
  databaseFile: resolve(backendRoot, process.env.DATABASE_FILE ?? 'data/sallora.db'),
  migrationsFolder: resolve(backendRoot, 'drizzle'),
}
