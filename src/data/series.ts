export type Point = { t: number; v: number }

/** All demo data is anchored to the date shown throughout the design. */
export const END_DATE = new Date(2024, 7, 6)
export const HISTORY_DAYS = 6 * 365
const DAY = 86_400_000

export type Shape =
  | { kind: 'anchors'; anchors: Array<[daysAgo: number, value: number]>; noise: number }
  | { kind: 'drift'; base: number; growth: number; weekly: number; noise: number }

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

function interpolate(anchors: Array<[number, number]>, daysAgo: number) {
  const sorted = [...anchors].sort((a, b) => b[0] - a[0])
  for (let i = 0; i < sorted.length - 1; i++) {
    const [d0, v0] = sorted[i]
    const [d1, v1] = sorted[i + 1]
    if (daysAgo <= d0 && daysAgo >= d1) {
      const span = d0 - d1 || 1
      const k = (d0 - daysAgo) / span
      const eased = (1 - Math.cos(Math.PI * k)) / 2
      return v0 + (v1 - v0) * eased
    }
  }
  return daysAgo > sorted[0][0] ? sorted[0][1] : sorted[sorted.length - 1][1]
}

const cache = new Map<string, Point[]>()

/** Daily points, oldest first, ending on END_DATE. Deterministic per key. */
export function seriesFor(key: string, shape: Shape): Point[] {
  const hit = cache.get(key)
  if (hit) return hit

  const rand = mulberry32(hash(key))
  const out: Point[] = []
  let ar = 0
  const end = END_DATE.getTime()

  for (let daysAgo = HISTORY_DAYS; daysAgo >= 0; daysAgo--) {
    const t = end - daysAgo * DAY
    const eps = rand() * 2 - 1
    ar = ar * 0.82 + eps * shape.noise
    let v: number
    if (shape.kind === 'anchors') {
      v = interpolate(shape.anchors, daysAgo) * (1 + ar)
    } else {
      const progress = 1 - daysAgo / HISTORY_DAYS
      const dow = new Date(t).getDay()
      const weekly = 1 + shape.weekly * Math.sin((dow / 7) * Math.PI * 2)
      v = shape.base * (1 + shape.growth * progress) * weekly * (1 + ar)
    }
    out.push({ t, v: Math.max(0, v) })
  }

  if (shape.kind === 'anchors') {
    const last = shape.anchors.find(([d]) => d === 0)
    if (last) out[out.length - 1].v = last[1]
  }

  cache.set(key, out)
  return out
}

export function windowOf(points: Point[], days: number, offsetDays = 0) {
  const endIndex = points.length - 1 - offsetDays
  const startIndex = Math.max(0, endIndex - days + 1)
  return points.slice(startIndex, endIndex + 1)
}

export function shiftYear(points: Point[], window: Point[]) {
  if (!window.length) return []
  const firstIndex = points.findIndex((p) => p.t === window[0].t)
  const from = firstIndex - 365
  if (from < 0) return []
  return points.slice(from, from + window.length).map((p, i) => ({ t: window[i].t, v: p.v }))
}