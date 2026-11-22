/**
 * Sallora data model, v1: everything the product stores.
 *
 * Every table comes from a flow or a business rule in docs/rules-and-flows.md
 * (rule IDs in the comments). docs/data-model.md has the picture and a line per table.
 *
 * Privacy by design (BR-01 to BR-06): there is no table for video, recordings,
 * faces or guests. The only image is the setup snapshot (BR-04), camera stream
 * logins stay on the box, and alerts never record which staff member answered (BR-06).
 *
 * Conventions
 * - ids are integers; timestamps are integer seconds since 1970 (UTC), Date objects in code
 * - enums are text columns with a CHECK constraint, because SQLite has no enum type
 * - deleting a venue deletes its data (BR-22), except invoices, which accounting needs
 *
 * To change the model: edit this file, then `npm run db:generate -- --name <what-changed>`,
 * `npm run db:migrate` and `npm run db:diagram`. Never edit a migration that has been applied.
 */
import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'

// ---------------------------------------------------------------------------
// Allowed values
// ---------------------------------------------------------------------------

export const LANGUAGES = ['sq', 'mk', 'en'] as const
export const COUNTRIES = ['XK', 'MK'] as const // Kosovo, North Macedonia
export const ROLES = ['owner', 'manager', 'waiter', 'installer', 'support'] as const
export const VENUE_STATUSES = ['setup', 'live'] as const
export const CONSENT_KINDS = ['terms', 'data_processing', 'privacy_checklist'] as const
export const ACCESS_KINDS = ['setup', 'support'] as const
export const TABLE_STATES = ['free', 'seated', 'waiting', 'needs_clearing', 'offline'] as const
export const TABLE_MARKS = ['reserved', 'closed'] as const
export const ZONE_SOURCES = ['claude', 'manual'] as const
export const EVENT_KINDS = ['state', 'visit'] as const
export const EVENT_SOURCES = ['box', 'tap'] as const
export const ALERT_KINDS = ['waiting', 'needs_clearing'] as const
export const ALERT_RESOLUTIONS = ['tap', 'seen', 'expired'] as const
export const REPORT_KINDS = ['nightly', 'weekly', 'pilot', 'monthly'] as const
export const SUBSCRIPTION_STATUSES = ['pilot', 'active', 'past_due', 'suspended', 'cancelled'] as const
export const PLANS = ['monthly', 'yearly'] as const
export const PAYMENT_METHODS = ['card', 'bank_transfer'] as const
export const INVOICE_STATUSES = ['open', 'paid', 'failed', 'void'] as const

// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

const now = sql`(unixepoch())`
const id = () => integer('id').primaryKey()
const timestamp = (name: string) => integer(name, { mode: 'timestamp' })
const createdAt = () => timestamp('created_at').notNull().default(now)
const boolean = (name: string) => integer(name, { mode: 'boolean' })
const venueId = () =>
  integer('venue_id')
    .notNull()
    .references(() => venues.id, { onDelete: 'cascade' })

/** CHECK that a text column holds one of the allowed values (NULL passes, so optional columns stay optional). */
function oneOf(name: string, column: AnySQLiteColumn, values: readonly string[]) {
  return check(name, sql`${column} in (${sql.raw(values.map((value) => `'${value}'`).join(', '))})`)
}

// ---------------------------------------------------------------------------
// 1. Venue and people
// ---------------------------------------------------------------------------

/** One café or restaurant location, with one subscription (BR-17). */
export const venues = sqliteTable(
  'venues',
  {
    id: id(),
    name: text('name').notNull(),
    city: text('city').notNull(),
    country: text('country', { enum: COUNTRIES }).notNull(),
    timezone: text('timezone').notNull().default('Europe/Belgrade'), // Kosovo's time zone; Skopje uses Europe/Skopje
    status: text('status', { enum: VENUE_STATUSES }).notNull().default('setup'),
    liveSince: timestamp('live_since'), // go-live needs the privacy checklist first (BR-05)
    waitingThresholdMin: integer('waiting_threshold_min').notNull().default(5), // BR-09
    clearingThresholdMin: integer('clearing_threshold_min').notNull().default(3), // BR-10
    createdAt: createdAt(),
  },
  (t) => [
    oneOf('venues_country_check', t.country, COUNTRIES),
    oneOf('venues_status_check', t.status, VENUE_STATUSES),
    // BR-09: one waiting threshold per venue, 2 to 15 minutes (default 5)
    check('venues_waiting_threshold_check', sql`${t.waitingThresholdMin} between 2 and 15`),
    // BR-10: the clearing alert comes after 1 to 10 minutes (default 3)
    check('venues_clearing_threshold_check', sql`${t.clearingThresholdMin} between 1 and 10`),
  ],
)

/**
 * A person who signs in: owner, manager, waiter, installer or Sallora support.
 * Guests are never users and are never stored (BR-02).
 */
export const users = sqliteTable(
  'users',
  {
    id: id(),
    name: text('name').notNull(), // what the team calls them, e.g. "Ana"
    email: text('email').unique(),
    phone: text('phone').unique(), // staff can be invited by phone (Flow 1.8)
    passwordHash: text('password_hash').notNull(),
    language: text('language', { enum: LANGUAGES }).notNull().default('sq'), // alerts and reports use it (BR-15)
    createdAt: createdAt(),
  },
  (t) => [
    oneOf('users_language_check', t.language, LANGUAGES),
    check('users_contact_check', sql`${t.email} is not null or ${t.phone} is not null`),
  ],
)

/** A user's role at one venue, from the roles table in rules-and-flows.md. */
export const venueMembers = sqliteTable(
  'venue_members',
  {
    id: id(),
    venueId: venueId(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ROLES }).notNull(),
    wantsEscalations: boolean('wants_escalations').notNull().default(false), // the owner can opt in (Flow 2.5)
    wantsReports: boolean('wants_reports').notNull().default(false), // managers can opt in; the owner always gets them (Flow 3.4)
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('venue_members_venue_user_idx').on(t.venueId, t.userId),
    index('venue_members_user_idx').on(t.userId),
    oneOf('venue_members_role_check', t.role, ROLES),
  ],
)

/** An invite link sent by email, WhatsApp or SMS (Flow 1.1 and 1.8). Only a hash of the token is kept. */
export const invites = sqliteTable(
  'invites',
  {
    id: id(),
    venueId: venueId(),
    role: text('role', { enum: ROLES }).notNull(),
    email: text('email'),
    phone: text('phone'),
    tokenHash: text('token_hash').notNull().unique(),
    invitedBy: integer('invited_by').references(() => users.id, { onDelete: 'set null' }),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    createdAt: createdAt(),
  },
  (t) => [
    index('invites_venue_idx').on(t.venueId),
    oneOf('invites_role_check', t.role, ROLES),
    check('invites_contact_check', sql`${t.email} is not null or ${t.phone} is not null`),
  ],
)

/**
 * What the owner agreed to and when: the terms and the data-processing agreement (Flow 1.2),
 * and the privacy checklist (Flow 1.9). BR-05: no venue goes live without a 'privacy_checklist'
 * row (a sign at every entrance, written notice to employees, no cameras in toilets or changing rooms).
 */
export const consents = sqliteTable(
  'consents',
  {
    id: id(),
    venueId: venueId(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // who confirmed
    kind: text('kind', { enum: CONSENT_KINDS }).notNull(),
    version: text('version').notNull(), // which text they agreed to, e.g. "2026-11"
    acceptedAt: timestamp('accepted_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('consents_venue_kind_version_idx').on(t.venueId, t.kind, t.version),
    oneOf('consents_kind_check', t.kind, CONSENT_KINDS),
  ],
)

/**
 * Time-boxed access the owner opens: the installer's setup window (at most 72 h, Flow 1.3)
 * and the support pass that lets Sallora support see a camera snapshot (at most 24 h).
 */
export const accessWindows = sqliteTable(
  'access_windows',
  {
    id: id(),
    venueId: venueId(),
    kind: text('kind', { enum: ACCESS_KINDS }).notNull(),
    grantedBy: integer('granted_by').references(() => users.id, { onDelete: 'set null' }),
    startsAt: timestamp('starts_at').notNull().default(now),
    endsAt: timestamp('ends_at').notNull(),
    closedAt: timestamp('closed_at'), // the owner closed it early
  },
  (t) => [
    index('access_windows_venue_idx').on(t.venueId, t.endsAt),
    oneOf('access_windows_kind_check', t.kind, ACCESS_KINDS),
    check(
      'access_windows_length_check',
      sql`${t.endsAt} > ${t.startsAt} and ${t.endsAt} - ${t.startsAt} <= case ${t.kind} when 'setup' then 259200 else 86400 end`,
    ),
  ],
)

// ---------------------------------------------------------------------------
// 2. Devices and floor map
// ---------------------------------------------------------------------------

/** The Sallora Box: the small computer at the venue that reads the cameras locally (BR-01). It is ours, on loan. */
export const boxes = sqliteTable(
  'boxes',
  {
    id: id(),
    venueId: integer('venue_id').references(() => venues.id, { onDelete: 'set null' }), // empty while in stock
    serial: text('serial').notNull().unique(),
    tokenHash: text('token_hash').unique(), // the box's key for sending table events; only a hash is kept
    softwareVersion: text('software_version'),
    lastSeenAt: timestamp('last_seen_at'), // heartbeat: offline after 2 minutes (BR-23)
    installedAt: timestamp('installed_at'),
    returnedAt: timestamp('returned_at'), // back within 14 days of cancelling, or €150 (BR-19)
    createdAt: createdAt(),
  },
  (t) => [index('boxes_venue_idx').on(t.venueId)],
)

/**
 * An existing CCTV camera. Its stream address and login stay on the box and never reach the cloud (BR-01).
 * Up to 4 cameras are included; each extra camera is €9 a month (BR-17, subscriptions.extra_cameras).
 */
export const cameras = sqliteTable(
  'cameras',
  {
    id: id(),
    venueId: venueId(),
    boxId: integer('box_id').references(() => boxes.id, { onDelete: 'set null' }),
    name: text('name').notNull(), // e.g. "Hall, by the bar"
    lastFrameAt: timestamp('last_frame_at'), // stream health: offline after 2 minutes (BR-23)
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('cameras_venue_name_idx').on(t.venueId, t.name)],
)

/**
 * BR-04: the only image Sallora keeps, one still per camera for drawing the zones. Only the owner,
 * manager and installer can see it. It is deleted at go-live unless the owner keeps a blurred copy
 * (Flow 1.11). The image is a file; the database keeps only its path.
 */
export const snapshots = sqliteTable(
  'snapshots',
  {
    id: id(),
    cameraId: integer('camera_id')
      .notNull()
      .references(() => cameras.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    isBlurred: boolean('is_blurred').notNull().default(false),
    takenAt: timestamp('taken_at').notNull().default(now),
  },
  (t) => [index('snapshots_camera_idx').on(t.cameraId)],
)

/** The group of tables one waiter covers during a shift, e.g. "Terrace" (BR-11). */
export const sections = sqliteTable(
  'sections',
  {
    id: id(),
    venueId: venueId(),
    name: text('name').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('sections_venue_name_idx').on(t.venueId, t.name)],
)

/**
 * A numbered table (T01, T02…), called dining_tables so it is never confused with a database table.
 * `state` is what the live board shows now, kept in step with table_events (BR-07, BR-08, BR-10, BR-23).
 * Up to 40 tables per subscription (BR-17).
 */
export const diningTables = sqliteTable(
  'dining_tables',
  {
    id: id(),
    venueId: venueId(),
    sectionId: integer('section_id').references(() => sections.id, { onDelete: 'set null' }),
    number: integer('number').notNull(), // shown as T04
    markedAs: text('marked_as', { enum: TABLE_MARKS }), // Reserved or Closed tables get no alerts (BR-13)
    state: text('state', { enum: TABLE_STATES }).notNull().default('free'),
    stateSince: timestamp('state_since'),
    lastVisitAt: timestamp('last_visit_at'), // every visit restarts the timer (BR-08)
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('dining_tables_venue_number_idx').on(t.venueId, t.number),
    index('dining_tables_section_idx').on(t.sectionId),
    check('dining_tables_number_check', sql`${t.number} between 1 and 999`),
    oneOf('dining_tables_marked_as_check', t.markedAs, TABLE_MARKS),
    oneOf('dining_tables_state_check', t.state, TABLE_STATES),
  ],
)

/** The outline of one table on one camera image (Flow 1.6). A table has zones on 1 or 2 cameras. */
export const zones = sqliteTable(
  'zones',
  {
    id: id(),
    tableId: integer('table_id')
      .notNull()
      .references(() => diningTables.id, { onDelete: 'cascade' }),
    cameraId: integer('camera_id')
      .notNull()
      .references(() => cameras.id, { onDelete: 'cascade' }),
    // Corner points from 0 to 1 across the image, so the outline fits any resolution.
    polygon: text('polygon', { mode: 'json' }).$type<[x: number, y: number][]>().notNull(),
    source: text('source', { enum: ZONE_SOURCES }).notNull(), // proposed by Claude from the snapshot, or drawn by hand
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('zones_table_camera_idx').on(t.tableId, t.cameraId),
    index('zones_camera_idx').on(t.cameraId),
    oneOf('zones_source_check', t.source, ZONE_SOURCES),
  ],
)

// ---------------------------------------------------------------------------
// 3. Service
// ---------------------------------------------------------------------------

/** Opening hours. Alerts fire only inside them (BR-13); the nightly report goes out 30 minutes after closing (BR-15). */
export const serviceHours = sqliteTable(
  'service_hours',
  {
    id: id(),
    venueId: venueId(),
    weekday: integer('weekday').notNull(), // 1 = Monday … 7 = Sunday
    opensAt: text('opens_at').notNull(), // "08:00", venue time
    closesAt: text('closes_at').notNull(), // "01:00": earlier than opens_at means after midnight
  },
  (t) => [
    uniqueIndex('service_hours_venue_day_idx').on(t.venueId, t.weekday, t.opensAt),
    check('service_hours_weekday_check', sql`${t.weekday} between 1 and 7`),
    check(
      'service_hours_time_check',
      sql`length(${t.opensAt}) = 5 and time(${t.opensAt}) is not null and length(${t.closesAt}) = 5 and time(${t.closesAt}) is not null`,
    ),
  ],
)

/** A working period, e.g. Friday evening. The manager on duty gets the escalations (BR-12). */
export const shifts = sqliteTable(
  'shifts',
  {
    id: id(),
    venueId: venueId(),
    startsAt: timestamp('starts_at').notNull(),
    endsAt: timestamp('ends_at').notNull(),
    managerOnDutyId: integer('manager_on_duty_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    index('shifts_venue_starts_idx').on(t.venueId, t.startsAt),
    check('shifts_time_check', sql`${t.endsAt} > ${t.startsAt}`),
  ],
)

/** Who works a shift and which section they cover. Tables nobody covers alert every waiter on shift (BR-11). */
export const shiftAssignments = sqliteTable(
  'shift_assignments',
  {
    id: id(),
    shiftId: integer('shift_id')
      .notNull()
      .references(() => shifts.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sectionId: integer('section_id').references(() => sections.id, { onDelete: 'set null' }), // empty: on shift, no section
  },
  (t) => [
    uniqueIndex('shift_assignments_shift_user_section_idx').on(t.shiftId, t.userId, t.sectionId),
    index('shift_assignments_user_idx').on(t.userId),
  ],
)

/**
 * What happened at a table, sent by the box as it happens (Flow 3.1) or by a tap in the app.
 * BR-01: only the table, the state, the time and the number of people, never images.
 * Taps do not record who tapped (BR-06). Kept for 13 months, then only monthly totals remain (BR-21).
 */
export const tableEvents = sqliteTable(
  'table_events',
  {
    id: id(),
    venueId: venueId(), // also reachable through the table; kept here so a day's report reads one venue fast
    tableId: integer('table_id')
      .notNull()
      .references(() => diningTables.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: EVENT_KINDS }).notNull(),
    state: text('state', { enum: TABLE_STATES }), // the new state, for kind = 'state'
    peopleCount: integer('people_count'), // how many people are in the zone: a number, never who
    source: text('source', { enum: EVENT_SOURCES }).notNull(),
    occurredAt: timestamp('occurred_at').notNull(),
  },
  (t) => [
    index('table_events_venue_time_idx').on(t.venueId, t.occurredAt),
    index('table_events_table_time_idx').on(t.tableId, t.occurredAt),
    oneOf('table_events_kind_check', t.kind, EVENT_KINDS),
    oneOf('table_events_state_value_check', t.state, TABLE_STATES),
    oneOf('table_events_source_check', t.source, EVENT_SOURCES),
    check('table_events_state_check', sql`(${t.kind} = 'state') = (${t.state} is not null)`),
    check('table_events_people_check', sql`${t.peopleCount} is null or ${t.peopleCount} >= 0`),
  ],
)

/**
 * An alert to the section's waiter (BR-11): the table has waited (BR-09) or needs clearing (BR-10).
 * Unanswered after 2 minutes, it escalates to the manager on duty; a table alerts at most once
 * every 5 minutes (BR-12). BR-06: only when and how it was answered is kept, never who answered.
 */
export const alerts = sqliteTable(
  'alerts',
  {
    id: id(),
    venueId: venueId(),
    tableId: integer('table_id')
      .notNull()
      .references(() => diningTables.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ALERT_KINDS }).notNull(),
    openedAt: timestamp('opened_at').notNull().default(now),
    escalatedAt: timestamp('escalated_at'),
    resolvedAt: timestamp('resolved_at'),
    // tap: On my way, Served or Cleared · seen: the box saw a visit or a clear table · expired: guests left, offline or closing time
    resolution: text('resolution', { enum: ALERT_RESOLUTIONS }),
  },
  (t) => [
    index('alerts_venue_opened_idx').on(t.venueId, t.openedAt),
    index('alerts_table_opened_idx').on(t.tableId, t.openedAt),
    oneOf('alerts_kind_check', t.kind, ALERT_KINDS),
    oneOf('alerts_resolution_value_check', t.resolution, ALERT_RESOLUTIONS),
    check('alerts_resolution_check', sql`(${t.resolvedAt} is null) = (${t.resolution} is null)`),
  ],
)

/**
 * A box or camera offline for more than 2 minutes during service hours (BR-23, Flow 2.9). Its tables
 * show Offline; the owner and manager get one push, then one SMS if it is still down after 10 minutes.
 */
export const outages = sqliteTable(
  'outages',
  {
    id: id(),
    venueId: venueId(),
    boxId: integer('box_id').references(() => boxes.id, { onDelete: 'cascade' }),
    cameraId: integer('camera_id').references(() => cameras.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at').notNull(),
    endedAt: timestamp('ended_at'),
    pushSentAt: timestamp('push_sent_at'),
    smsSentAt: timestamp('sms_sent_at'),
  },
  (t) => [
    index('outages_venue_started_idx').on(t.venueId, t.startedAt),
    check('outages_device_check', sql`${t.boxId} is not null or ${t.cameraId} is not null`),
  ],
)

/** A phone or browser that receives push alerts from the web app (Flow 1.8). A user can have several. */
export const pushSubscriptions = sqliteTable(
  'push_subscriptions',
  {
    id: id(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(), // the browser's public key for encrypting pushes
    auth: text('auth').notNull(), // the browser's push secret
    createdAt: createdAt(),
  },
  (t) => [index('push_subscriptions_user_idx').on(t.userId)],
)

// ---------------------------------------------------------------------------
// 4. Reports and AI
// ---------------------------------------------------------------------------

/**
 * The nightly report (BR-15), the Monday summary, the day-14 pilot report (BR-18) and the monthly
 * totals that outlive the events (BR-21). `stats` holds venue and table numbers only, never per-waiter
 * numbers (BR-06); Claude writes `body` from `stats` alone, never from images or personal data (BR-16).
 */
export const reports = sqliteTable(
  'reports',
  {
    id: id(),
    venueId: venueId(),
    kind: text('kind', { enum: REPORT_KINDS }).notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    stats: text('stats', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
    language: text('language', { enum: LANGUAGES }).notNull(), // the owner's language (BR-15)
    body: text('body'), // Claude's ~150 words; empty for monthly totals
    model: text('model'), // e.g. "claude-opus-5-5"
    createdAt: createdAt(),
    sentAt: timestamp('sent_at'),
  },
  (t) => [
    uniqueIndex('reports_venue_kind_period_idx').on(t.venueId, t.kind, t.periodStart),
    oneOf('reports_kind_check', t.kind, REPORT_KINDS),
    oneOf('reports_language_check', t.language, LANGUAGES),
  ],
)

/** A question the owner or a manager asks about the numbers, and Claude's answer from this venue's numbers only (Flow 3.5). */
export const questions = sqliteTable(
  'questions',
  {
    id: id(),
    venueId: venueId(),
    askedBy: integer('asked_by').references(() => users.id, { onDelete: 'set null' }),
    question: text('question').notNull(),
    answer: text('answer'),
    model: text('model'),
    createdAt: createdAt(),
  },
  (t) => [index('questions_venue_created_idx').on(t.venueId, t.createdAt)],
)

// ---------------------------------------------------------------------------
// 5. Billing
// ---------------------------------------------------------------------------

/**
 * The venue's plan (Flow 4). A 14-day free pilot with no card (BR-18), then €39 a month or €390 a year
 * (€29 for founding venues). past_due: 7 days of grace, alerts pause on day 8, suspended on day 21 (BR-20).
 * Cancelled: runs to ends_at (BR-19), and the venue's data is deleted 30 days later (BR-22).
 */
export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: id(),
    venueId: integer('venue_id')
      .notNull()
      .unique()
      .references(() => venues.id, { onDelete: 'cascade' }),
    status: text('status', { enum: SUBSCRIPTION_STATUSES }).notNull().default('pilot'),
    plan: text('plan', { enum: PLANS }), // chosen on day 14
    priceCents: integer('price_cents'), // 3900 a month, 39000 a year, 2900 for founding venues
    isFounding: boolean('is_founding').notNull().default(false), // first 10 venues: €29 for 12 months, free setup
    extraCameras: integer('extra_cameras').notNull().default(0), // above the 4 included, €9 a month each (BR-17)
    paymentMethod: text('payment_method', { enum: PAYMENT_METHODS }),
    pilotStartedAt: timestamp('pilot_started_at'), // days 1–3 silent, days 4–14 with alerts (BR-18)
    currentPeriodEnd: timestamp('current_period_end'), // renews on the same date (Flow 4.4)
    cancelledAt: timestamp('cancelled_at'),
    endsAt: timestamp('ends_at'), // the end of the paid period after cancelling
    createdAt: createdAt(),
  },
  (t) => [
    oneOf('subscriptions_status_check', t.status, SUBSCRIPTION_STATUSES),
    oneOf('subscriptions_plan_check', t.plan, PLANS),
    oneOf('subscriptions_payment_method_check', t.paymentMethod, PAYMENT_METHODS),
    check('subscriptions_amounts_check', sql`${t.extraCameras} >= 0 and (${t.priceCents} is null or ${t.priceCents} >= 0)`),
  ],
)

/**
 * An invoice: the monthly or yearly fee, the €149 setup fee with the first month, extra cameras, or
 * €150 for a box that was not returned (BR-19). Invoices survive the venue's deletion (BR-22) because
 * accounting law needs them, so `billed_to` keeps a copy of the business name and address.
 */
export const invoices = sqliteTable(
  'invoices',
  {
    id: id(),
    venueId: integer('venue_id').references(() => venues.id, { onDelete: 'set null' }),
    number: text('number').notNull().unique(), // e.g. "SAL-2026-0001"
    billedTo: text('billed_to').notNull(),
    lines: text('lines', { mode: 'json' }).$type<{ item: string; cents: number }[]>().notNull(),
    totalCents: integer('total_cents').notNull(),
    currency: text('currency').notNull().default('EUR'),
    status: text('status', { enum: INVOICE_STATUSES }).notNull().default('open'),
    issuedAt: timestamp('issued_at').notNull().default(now),
    dueAt: timestamp('due_at').notNull(),
    paidAt: timestamp('paid_at'),
  },
  (t) => [
    index('invoices_venue_idx').on(t.venueId),
    oneOf('invoices_status_check', t.status, INVOICE_STATUSES),
    check('invoices_total_check', sql`${t.totalCents} >= 0`),
  ],
)
