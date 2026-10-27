import type { Unit } from './metrics'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const moneyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatValue(v: number, unit: Unit, short = false) {
  switch (unit) {
    case 'percent':
      return `${v.toFixed(short ? 1 : 2)}%`
    case 'days':
      return `${v.toFixed(1)}d`
    case 'ms':
      return `${whole.format(v)}ms`
    case 'score':
      return v.toFixed(short ? 0 : 1)
    case 'currency':
      return short || v >= 100_000 ? moneyCompact.format(v) : money.format(v)
    default:
      return short && v >= 10_000 ? compact.format(v) : whole.format(v)
  }
}

export function formatAxis(v: number, unit: Unit) {
  if (unit === 'percent') return `${Math.round(v * 10) / 10}%`
  if (unit === 'currency') return moneyCompact.format(v)
  if (unit === 'ms') return `${whole.format(v)}`
  return v >= 1000 ? compact.format(v) : whole.format(v)
}

export function formatDelta(current: number, previous: number) {
  if (!previous) return 'n/a'
  const pct = ((current - previous) / previous) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fullFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })

export const fmtDay = (t: number) => dayFmt.format(t)
export const fmtFull = (t: number) => fullFmt.format(t)
export const fmtMonth = (t: number) => monthFmt.format(t).replace(' ', " '")
