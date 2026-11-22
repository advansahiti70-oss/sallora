/**
 * Draws the data model as an SVG picture (docs/data-model.svg) with no extra packages.
 * Tables sit in columns by group; links run in the gaps between columns, and links to the
 * two hubs (venues, users) share a "bus" across the top so the picture stays readable.
 */

export type ColumnInfo = { name: string; type: string; pk: boolean; fk: boolean }
export type TableInfo = { name: string; columns: ColumnInfo[] }
export type LinkInfo = { from: string; fromColumn: string; to: string; toColumn: string }
export type GroupLayout = { title: string; column: number; tables: string[] }

// Brand colours (docs/brand-book.md); every other shade is mixed from them.
const INK = '#172033'
const CREMA = '#FAF5EC'
const SAFFRON = '#F5A524'

function mix(a: string, b: string, amountOfA: number): string {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [ca, cb] = [channels(a), channels(b)]
  const out = ca.map((value, i) => Math.round(value * amountOfA + cb[i]! * (1 - amountOfA)))
  return `#${out.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

const COLOR = {
  canvas: CREMA,
  panel: mix(INK, CREMA, 0.06),
  panelLabel: mix(INK, CREMA, 0.7),
  cardBorder: mix(INK, CREMA, 0.22),
  rowLine: mix(INK, CREMA, 0.08),
  muted: mix(INK, CREMA, 0.55),
  fkTag: mix(INK, CREMA, 0.12),
  hubLine: mix(INK, CREMA, 0.42),
  localLine: mix(INK, CREMA, 0.78),
}

const SANS = `Manrope, 'Segoe UI', Helvetica, Arial, sans-serif`
const MONO = `'JetBrains Mono', Consolas, Menlo, 'DejaVu Sans Mono', monospace`

const ROW = 19
const HEADER = 28
const CARD_GAP = 22
const PANEL_PAD = 14
const PANEL_LABEL = 30
const PANEL_GAP = 28
const LANE = 11
const MARGIN_RIGHT = 40
const TITLE_HEIGHT = 74
const FONT = 11.5
const CHAR = FONT * 0.62 // a generous width per monospace character

const esc = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A path through the given corners, with rounded bends. */
function roundedPath(points: [number, number][], radius = 6): string {
  let d = `M${points[0]![0]},${points[0]![1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1]!
    const [x, y] = points[i]!
    const [nx, ny] = points[i + 1]!
    const r = Math.min(radius, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2)
    const inX = x - Math.sign(x - px) * r
    const inY = y - Math.sign(y - py) * r
    const outX = x + Math.sign(nx - x) * r
    const outY = y + Math.sign(ny - y) * r
    d += ` L${inX},${inY} Q${x},${y} ${outX},${outY}`
  }
  const [lx, ly] = points[points.length - 1]!
  return `${d} L${lx},${ly}`
}

export function renderSvg(tables: TableInfo[], links: LinkInfo[], layout: GroupLayout[]): string {
  const byName = new Map(tables.map((table) => [table.name, table]))
  const columnOf = new Map<string, number>()
  for (const group of layout) for (const name of group.tables) columnOf.set(name, group.column)
  const columnCount = Math.max(...layout.map((group) => group.column)) + 1

  // Tables with many incoming links from other columns are hubs: their links share the top bus.
  const incoming = new Map<string, number>()
  for (const link of links) {
    if (columnOf.get(link.from) !== columnOf.get(link.to)) incoming.set(link.to, (incoming.get(link.to) ?? 0) + 1)
  }
  const isHub = (name: string) => (incoming.get(name) ?? 0) >= 5

  type Route = { link: LinkInfo; kind: 'same' | 'adjacent' | 'bus' }
  const routes: Route[] = links.map((link) => {
    const from = columnOf.get(link.from)!
    const to = columnOf.get(link.to)!
    if (from === to) return { link, kind: 'same' }
    if (to === from - 1 && !isHub(link.to)) return { link, kind: 'adjacent' }
    return { link, kind: 'bus' }
  })

  // Lanes: vertical tracks in the gap to the left of each column, one per target table and kind.
  const lanesByGap = new Map<number, string[]>()
  const addLane = (gap: number, key: string) => {
    const lanes = lanesByGap.get(gap) ?? []
    if (!lanes.includes(key)) lanes.push(key)
    lanesByGap.set(gap, lanes)
  }
  for (const { link, kind } of routes) {
    const from = columnOf.get(link.from)!
    const to = columnOf.get(link.to)!
    if (kind === 'adjacent') addLane(from, `adjacent:${link.to}`)
    else if (kind === 'same') addLane(from, `left:${link.to}`)
    else {
      addLane(from, `left:${link.to}`)
      addLane(to, `left:${link.to}`)
    }
  }
  // Adjacent lanes sit nearest the column on the left; hub lanes nearest the column on the right.
  for (const [gap, lanes] of lanesByGap) {
    const rank = (key: string) => (key.startsWith('adjacent:') ? 0 : isHub(key.slice(5)) ? 2 : 1)
    lanesByGap.set(gap, [...lanes].sort((a, b) => rank(a) - rank(b)))
  }
  const busTargets = [...new Set(routes.filter((route) => route.kind === 'bus').map((route) => route.link.to))]

  // Column widths from the longest "name + type" row.
  const columnWidth: number[] = Array.from({ length: columnCount }, () => 0)
  for (const table of tables) {
    const column = columnOf.get(table.name)!
    const longest = Math.max(
      table.name.length * 1.1,
      ...table.columns.map((c) => c.name.length + c.type.length + 2),
    )
    columnWidth[column] = Math.max(columnWidth[column]!, Math.ceil(longest * CHAR + 44))
  }

  const gapWidth = (gap: number) => Math.max(gap === 0 ? 48 : 64, 28 + (lanesByGap.get(gap)?.length ?? 0) * LANE)
  const columnX: number[] = []
  let x = 0
  for (let column = 0; column < columnCount; column++) {
    x += gapWidth(column) + PANEL_PAD
    columnX.push(x)
    x += columnWidth[column]! + PANEL_PAD
  }
  const width = x + MARGIN_RIGHT

  const busTop = TITLE_HEIGHT + 8
  const panelsTop = busTop + busTargets.length * LANE + 18

  // Place cards top to bottom in each column.
  type Card = { table: TableInfo; x: number; y: number; w: number; h: number }
  const cards = new Map<string, Card>()
  const panels: { title: string; x: number; y: number; w: number; h: number }[] = []
  const columnBottom: number[] = Array.from({ length: columnCount }, () => panelsTop)
  layout.forEach((group, index) => {
    const column = group.column
    const top = columnBottom[column]!
    let y = top + PANEL_LABEL
    for (const name of group.tables) {
      const table = byName.get(name)
      if (!table) throw new Error(`diagram layout names an unknown table: ${name}`)
      const h = HEADER + table.columns.length * ROW
      cards.set(name, { table, x: columnX[column]!, y, w: columnWidth[column]!, h })
      y += h + CARD_GAP
    }
    const bottom = y - CARD_GAP + PANEL_PAD
    panels.push({
      title: `${index + 1}  ${group.title}`,
      x: columnX[column]! - PANEL_PAD,
      y: top,
      w: columnWidth[column]! + PANEL_PAD * 2,
      h: bottom - top,
    })
    columnBottom[column] = bottom + PANEL_GAP
  })
  const height = Math.max(...columnBottom) + 24

  const rowY = (table: string, column: string) => {
    const card = cards.get(table)!
    const index = card.table.columns.findIndex((c) => c.name === column)
    return card.y + HEADER + index * ROW + ROW / 2
  }
  const laneX = (gap: number, key: string) => {
    const lanes = lanesByGap.get(gap)!
    const gapLeft = gap === 0 ? 0 : columnX[gap - 1]! + columnWidth[gap - 1]! + PANEL_PAD
    const gapRight = columnX[gap]! - PANEL_PAD
    const start = gapLeft + (gapRight - gapLeft - (lanes.length - 1) * LANE) / 2
    return start + lanes.indexOf(key) * LANE
  }
  const busY = (target: string) => busTop + busTargets.indexOf(target) * LANE

  // Lines
  const lines: string[] = []
  const ends: string[] = []
  for (const { link, kind } of routes) {
    const from = cards.get(link.from)!
    const to = cards.get(link.to)!
    const fromColumn = columnOf.get(link.from)!
    const toColumn = columnOf.get(link.to)!
    const y1 = rowY(link.from, link.fromColumn)
    const y2 = rowY(link.to, link.toColumn)
    let points: [number, number][]
    let arrowLeftward = false
    if (kind === 'adjacent') {
      const lx = laneX(fromColumn, `adjacent:${link.to}`)
      points = [[from.x, y1], [lx, y1], [lx, y2], [to.x + to.w, y2]]
      arrowLeftward = true
    } else if (kind === 'same') {
      const lx = laneX(fromColumn, `left:${link.to}`)
      points = [[from.x, y1], [lx, y1], [lx, y2], [to.x, y2]]
    } else {
      const childLane = laneX(fromColumn, `left:${link.to}`)
      const parentLane = laneX(toColumn, `left:${link.to}`)
      const by = busY(link.to)
      points = [[from.x, y1], [childLane, y1], [childLane, by], [parentLane, by], [parentLane, y2], [to.x, y2]]
    }
    const color = isHub(link.to) ? COLOR.hubLine : COLOR.localLine
    lines.push(`<path d="${roundedPath(points)}" fill="none" stroke="${color}" stroke-width="1.4"/>`)
    ends.push(`<circle cx="${points[0]![0]}" cy="${y1}" r="2.6" fill="${color}"/>`)
    const [ex, ey] = points[points.length - 1]!
    const dir = arrowLeftward ? 1 : -1 // the arrow tip touches the card edge
    ends.push(
      `<path d="M${ex},${ey} l${dir * 7},-4 l0,8 z" fill="${INK}"/>`,
    )
  }

  // Cards
  const cardSvg: string[] = []
  for (const { table, x: cx, y: cy, w, h } of cards.values()) {
    const rows = table.columns
      .map((column, i) => {
        const ry = cy + HEADER + i * ROW
        const tag = column.pk ? 'PK' : column.fk ? 'FK' : ''
        const tagSvg = tag
          ? `<rect x="${cx + 7}" y="${ry + 4}" width="20" height="11" rx="3" fill="${column.pk ? INK : COLOR.fkTag}"/>` +
            `<text x="${cx + 17}" y="${ry + 12.6}" font-family="${SANS}" font-size="7.5" font-weight="700" text-anchor="middle" fill="${column.pk ? CREMA : INK}">${tag}</text>`
          : ''
        const line = i > 0 ? `<line x1="${cx + 1}" y1="${ry}" x2="${cx + w - 1}" y2="${ry}" stroke="${COLOR.rowLine}"/>` : ''
        return (
          line +
          tagSvg +
          `<text x="${cx + 33}" y="${ry + 13.4}" font-family="${MONO}" font-size="${FONT}" fill="${INK}">${esc(column.name)}</text>` +
          `<text x="${cx + w - 9}" y="${ry + 13.4}" font-family="${MONO}" font-size="${FONT - 1}" fill="${COLOR.muted}" text-anchor="end">${esc(column.type)}</text>`
        )
      })
      .join('')
    cardSvg.push(
      `<g>` +
        `<rect x="${cx}" y="${cy}" width="${w}" height="${h}" rx="7" fill="${CREMA}" stroke="${COLOR.cardBorder}"/>` +
        `<path d="M${cx},${cy + HEADER} v-${HEADER - 7} q0,-7 7,-7 h${w - 14} q7,0 7,7 v${HEADER - 7} z" fill="${INK}"/>` +
        `<text x="${cx + 10}" y="${cy + 18.5}" font-family="${SANS}" font-size="13" font-weight="700" fill="${CREMA}">${esc(table.name)}</text>` +
        rows +
        `</g>`,
    )
  }

  const panelSvg = panels.map(
    (panel) =>
      `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="12" fill="${COLOR.panel}"/>` +
      `<text x="${panel.x + 14}" y="${panel.y + 20}" font-family="${SANS}" font-size="12" font-weight="700" letter-spacing="0.06em" fill="${COLOR.panelLabel}">${esc(panel.title.toUpperCase())}</text>`,
  )

  const title =
    // The Sallora mark: a round table seen from above, with the saffron timer arc.
    `<g transform="translate(${columnX[0]! - PANEL_PAD}, 22)">` +
    `<circle cx="14" cy="14" r="10.5" fill="none" stroke="${INK}" stroke-width="4"/>` +
    `<path d="M14 3.5A10.5 10.5 0 0 1 21.42 21.42" fill="none" stroke="${SAFFRON}" stroke-width="4" stroke-linecap="round"/>` +
    `<text x="36" y="20.5" font-family="${SANS}" font-size="20" font-weight="800" fill="${INK}">Sallora data model (v1)</text>` +
    `<text x="36" y="42" font-family="${SANS}" font-size="12" fill="${COLOR.muted}">${tables.length} tables in ${layout.length} groups · PK primary key · FK link column · each line runs from a link column (●) to the table it points to (▶); lighter lines go to venues · drawn from backend/src/db/schema.ts by npm run db:diagram</text>` +
    `</g>`

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">`,
    `<title id="title">Sallora data model: ${tables.length} tables and how they link</title>`,
    `<rect width="${width}" height="${height}" fill="${COLOR.canvas}"/>`,
    title,
    ...panelSvg,
    ...lines,
    ...cardSvg,
    ...ends,
    `</svg>`,
  ].join('\n')
}
