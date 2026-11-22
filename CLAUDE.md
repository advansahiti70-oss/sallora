# Sallora: instructions for Claude Code

Sallora turns a café or restaurant's existing CCTV cameras into a live table board for waiters and a nightly report for the owner. Market: Kosovo and North Macedonia.

## Rule zero: read `docs/` before you change anything

1. `docs/rules-and-flows.md`: roles, flows and business rules (BR-01…BR-23). **This is the source of truth for product logic.** Cite rule IDs in code comments and tests (e.g. `// BR-07: seated after 60 s in zone`).
2. `docs/brand-book.md`: colours, fonts, tone of voice. Use its CSS tokens (`frontend/src/styles/tokens.css`); never hard-code other colours.
3. `docs/business.md`: who the customer is, pricing (€39 per venue per month), costs.
4. `docs/stack.md`: the stack and why. `docs/data-model.md`: the 23 tables and how they link.

## Stack

- **Front end:** React 19 + Vite 8 + TypeScript in `frontend/`. One page so far: the landing page.
- **Back end:** Hono 4 on Node.js 24 + TypeScript in `backend/`. One endpoint so far: `GET /health`.
- **Database:** SQLite, one file at `backend/data/sallora.db` (git-ignored), through Drizzle ORM + better-sqlite3. Models in `backend/src/db/schema.ts`, migrations in `backend/drizzle/`.
- **One npm workspace:** run every command from the repository root. Node 24 (`.nvmrc`), at least 22.12.
- **No install scripts:** `.npmrc` sets `ignore-scripts=true`, so a classmate's `npm install` never compiles anything. Only add dependencies that ship prebuilt binaries (no node-gyp).

## Folder layout

```
CLAUDE.md · README.md · package.json (workspaces + scripts) · .npmrc · .nvmrc
docs/        product docs (read first), brand files, stack.md, data-model.md (+ .svg, .dbml), hand-in/
frontend/    React + Vite
  src/App.tsx                 the landing page
  src/components/             Logo, LanguageSwitcher
  src/i18n/messages.ts        every user-facing string in sq, mk, en
  src/styles/tokens.css       brand tokens (copied from the brand book)
  public/                     favicon (the Sallora mark)
backend/     Hono + Drizzle + SQLite
  src/index.ts                starts the server (API_PORT, default 3000)
  src/app.ts                  builds the app; tests call it without a server
  src/routes/health.ts        GET /health
  src/db/schema.ts            THE data model
  src/db/client.ts            opens SQLite (foreign keys on, WAL)
  src/db/migrate.ts           npm run db:migrate
  src/db/diagram*.ts          npm run db:diagram (docs/data-model.svg + .dbml)
  drizzle/                    migrations, generated: never edit one that has run
  test/                       node:test tests, named after the rules they check
box/         (later) the Sallora Box in Python. Does not exist yet.
```

## Commands (from the repository root)

| Command | What it does |
|---|---|
| `npm install` | Installs the front end and back end |
| `npm run db:migrate` | Creates or updates `backend/data/sallora.db` and lists its tables |
| `npm run dev` | Front end on http://localhost:5173, back end on http://localhost:3000/health |
| `npm test` | Back-end tests |
| `npm run typecheck` · `npm run lint` · `npm run build` | Run before saying a change is done |
| `npm run db:generate -- --name what-changed` | After editing `schema.ts`: writes the next migration |
| `npm run db:diagram` | Redraws `docs/data-model.svg` and `docs/data-model.dbml` |
| `npm run db:studio` | Browse the database in Drizzle Studio |

## Working rules

- **Data model:** change it only in `backend/src/db/schema.ts`, then `db:generate`, `db:migrate` and `db:diagram`, and update `docs/data-model.md`. Never edit an applied migration.
- **Front end:** brand tokens only; the Saffron arc is the only animation; every string goes in `src/i18n/messages.ts` in all three languages.
- **Back end:** new endpoints go under `/api/...` (Vite forwards `/api` in development). Keep `app.ts` free of server start-up so tests can call it. Settings go in `backend/.env` (see `.env.example`).
- **Done means:** `npm test`, `npm run typecheck` and `npm run lint` pass.

## Non-negotiable

- **Privacy rules BR-01 to BR-06:** video never leaves the venue; no faces, no identification, no audio; no recordings; no per-waiter scores. If a feature request conflicts with these, stop and ask.
- Do not build anything on the "What version one will NOT do" list in `docs/rules-and-flows.md`.
- Every user-facing string exists in **Albanian (sq), Macedonian (mk) and English (en)**. Tone: calm, direct, warm.
- The Claude API is used only for setup (proposing table zones from one snapshot), the nightly and weekly reports, and owner questions. Never on live video. Default model: `claude-opus-5-5`.
- Never commit secrets. Keys go in `.env`, which is git-ignored.
