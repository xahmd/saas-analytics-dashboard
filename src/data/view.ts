import type { ChartSeries } from '../components/LineChart'
import { dimensionValues, isAdditive, pointsFor, SEGMENT_SHARES, type Metric } from './metrics'
import { HISTORY_DAYS, shiftYear, windowOf, type Point } from './series'

export const PERIODS = ['Week', 'Month', 'Quarter', '6M', 'Year', '2Y', '5Y'] as const
export type Period = (typeof PERIODS)[number]

export const PERIOD_DAYS: Record<Period, number> = {
  Week: 7,
  Month: 30,
  Quarter: 90,
  '6M': 180,
  Year: 365,
  '2Y': 730,
  '5Y': 1825,
}

export const PERIOD_LABEL: Record<Period, string> = {
  Week: 'Last 7 days',
  Month: 'Last 30 days',
  Quarter: 'Last 90 days',
  '6M': 'Last 180 days',
  Year: 'Last 12 months',
  '2Y': 'Last 2 years',
  '5Y': 'Last 5 years',
}

export const SEGMENT_COLORS = ['var(--blue)', 'var(--amber)', 'var(--positive)']

export function canGoBack(period: Period, offset: number) {
  return (offset + 2) * PERIOD_DAYS[period] <= HISTORY_DAYS
}

function segment(points: Point[], metric: Metric, index: number): Point[] {
  const share = isAdditive(metric.unit) ? SEGMENT_SHARES[index] : 1 + (index - 1) * -0.14
  return points.map((p, i) => ({ t: p.t, v: p.v * share * (1 + 0.05 * Math.sin(i / 5 + index * 2.1)) }))
}

export type ViewOptions = {
  period: Period
  offset: number
  breakdown: string | null
  filter: { dimension: string; value: string } | null
  compareYear: boolean
}

export function buildView(metric: Metric, opts: ViewOptions) {
  const all = pointsFor(metric)
  const days = PERIOD_DAYS[opts.period]
  let win = windowOf(all, days, opts.offset * days)
  let prev = opts.compareYear ? shiftYear(all, win) : []

  if (opts.filter) {
    const idx = dimensionValues(opts.filter.dimension).indexOf(opts.filter.value)
    win = segment(win, metric, idx)
    prev = segment(prev, metric, idx)
  }

  const series: ChartSeries[] = []
  if (opts.breakdown) {
    dimensionValues(opts.breakdown).forEach((value, i) => {
      series.push({ id: value, label: value, points: segment(win, metric, i), color: SEGMENT_COLORS[i] })
    })
  } else {
    series.push({ id: 'main', label: metric.name, points: win, color: 'var(--blue)', area: true })
  }
  if (prev.length) series.push({ id: 'prev', label: 'Previous year', points: prev, color: 'var(--rose)' })

  return { win, prev, series }
}
