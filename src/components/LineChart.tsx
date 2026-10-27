import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Point } from '../data/series'
import type { Unit } from '../data/metrics'
import { fmtDay, fmtFull, fmtMonth, formatAxis, formatValue } from '../data/format'

export type ChartSeries = {
  id: string
  label: string
  points: Point[]
  color: string
  area?: boolean
}

type Props = {
  series: ChartSeries[]
  unit: Unit
  guides?: Array<{ label: string; value: number }>
  mode?: 'line' | 'bar'
  minHeight?: number
}

const PAD = { top: 18, right: 18, bottom: 30, left: 48 }

function niceStep(range: number, count: number) {
  const raw = range / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  return step * mag
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

function bucket(points: Point[], max: number) {
  if (points.length <= max) return points
  const size = Math.ceil(points.length / max)
  const out: Point[] = []
  for (let i = 0; i < points.length; i += size) {
    const chunk = points.slice(i, i + size)
    out.push({ t: chunk[chunk.length - 1].t, v: chunk.reduce((s, p) => s + p.v, 0) / chunk.length })
  }
  return out
}

export function LineChart({ series, unit, guides = [], mode = 'line', minHeight = 260 }: Props) {
  const gradientId = useId()
  const [ref, { w, h }] = useSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const primary = series[0]
  const shown = useMemo(
    () => (mode === 'bar' ? series.map((s) => ({ ...s, points: bucket(s.points, 64) })) : series),
    [series, mode],
  )
  const base = shown[0]?.points ?? []

  const scale = useMemo(() => {
    const values = shown.flatMap((s) => s.points.map((p) => p.v))
    values.push(...guides.map((g) => g.value))
    const max = Math.max(...values, 0)
    const min = Math.min(...values, 0)
    const lo = min < 0 ? min : 0
    const step = niceStep((max - lo) * 1.08 || 1, 5)
    const top = Math.ceil((max * 1.04) / step) * step || step
    const ticks: number[] = []
    for (let v = lo; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(6)))
    return { lo, top, ticks }
  }, [shown, guides])

  const innerW = Math.max(0, w - PAD.left - PAD.right)
  const innerH = Math.max(0, h - PAD.top - PAD.bottom)
  const n = base.length
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - ((v - scale.lo) / (scale.top - scale.lo || 1)) * innerH

  const spanDays = n > 1 ? (base[n - 1].t - base[0].t) / 86_400_000 : 0
  const xLabel = spanDays > 200 ? fmtMonth : fmtDay
  const tickCount = Math.max(2, Math.min(10, Math.floor(innerW / 90)))
  const xTicks = n > 1 ? Array.from({ length: tickCount }, (_, k) => Math.round((k / (tickCount - 1)) * (n - 1))) : []

  const pathFor = (points: Point[]) => {
    const len = points.length
    return points
      .map((p, i) => {
        const px = PAD.left + (len <= 1 ? innerW / 2 : (i / (len - 1)) * innerW)
        return `${i ? 'L' : 'M'}${px.toFixed(1)},${y(p.v).toFixed(1)}`
      })
      .join('')
  }

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))))
  }

  const hoverPoint = hover != null ? base[hover] : null
  const tooltipLeft = hover != null ? x(hover) : 0
  const flip = tooltipLeft > w * 0.62
  const barW = Math.max(2, (innerW / Math.max(n, 1)) * 0.62)

  return (
    <div ref={ref} className="chart" style={{ minHeight }}>
      {w > 0 && h > 0 && (
        <svg width={w} height={h} role="img" aria-label={`${primary?.label} chart`}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={primary?.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={primary?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {scale.ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} className="chart-grid" />
              <text x={PAD.left - 12} y={y(v)} className="chart-axis" textAnchor="end" dominantBaseline="middle">
                {formatAxis(v, unit)}
              </text>
            </g>
          ))}

          {xTicks.map((i) => (
            <text key={i} x={x(i)} y={h - 10} className="chart-axis" textAnchor="middle">
              {xLabel(base[i].t)}
            </text>
          ))}

          {guides.map((g) => (
            <g key={g.label}>
              <line x1={PAD.left} x2={w - PAD.right} y1={y(g.value)} y2={y(g.value)} className="chart-guide" />
              <circle cx={w - PAD.right} cy={y(g.value)} r={3} fill="var(--guide)" />
              <text x={w - PAD.right - 8} y={y(g.value) - 7} className="chart-guide-label" textAnchor="end">
                {g.label}
              </text>
            </g>
          ))}

          {shown
            .slice()
            .reverse()
            .map((s, ri) => {
              const isPrimary = ri === shown.length - 1
              if (isPrimary && mode === 'bar') {
                return (
                  <g key={s.id}>
                    {s.points.map((p, i) => (
                      <rect
                        key={p.t}
                        x={x(i) - barW / 2}
                        y={y(p.v)}
                        width={barW}
                        height={Math.max(0, y(scale.lo) - y(p.v))}
                        rx={Math.min(3, barW / 2)}
                        fill={s.color}
                        opacity={hover == null || hover === i ? 0.9 : 0.45}
                      />
                    ))}
                  </g>
                )
              }
              const d = pathFor(s.points)
              const last = s.points[s.points.length - 1]
              return (
                <g key={s.id}>
                  {s.area && (
                    <path d={`${d}L${x(n - 1)},${y(scale.lo)}L${x(0)},${y(scale.lo)}Z`} fill={`url(#${gradientId})`} />
                  )}
                  <path d={d} fill="none" stroke={s.color} strokeWidth={1.6} className="chart-line" pathLength={1} />
                  {last && <circle cx={x(s.points.length - 1)} cy={y(last.v)} r={3.5} fill={s.color} className="chart-end" />}
                </g>
              )
            })}

          {hoverPoint && hover != null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} className="chart-cross" />
              {shown.map((s) => {
                const p = s.points[hover]
                if (!p || (mode === 'bar' && s === shown[0])) return null
                return <circle key={s.id} cx={x(hover)} cy={y(p.v)} r={4} fill="var(--bg)" stroke={s.color} strokeWidth={2} />
              })}
            </g>
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hoverPoint && hover != null && (
        <div
          className="chart-tip"
          style={{
            left: tooltipLeft,
            top: PAD.top + 6,
            transform: flip ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)',
          }}
        >
          <div className="chart-tip-date">{fmtFull(hoverPoint.t)}</div>
          {shown.map((s) => {
            const p = s.points[hover]
            if (!p) return null
            return (
              <div key={s.id} className="chart-tip-row">
                <span className="chart-tip-swatch" style={{ background: s.color }} />
                <span className="chart-tip-label">{s.label}</span>
                <span className="chart-tip-value tabular">{formatValue(p.v, unit)}</span>
              </div>
            )
          })}
          {guides.map((g) => (
            <div key={g.label} className="chart-tip-row">
              <span className="chart-tip-swatch is-dashed" />
              <span className="chart-tip-label">{g.label}</span>
              <span className="chart-tip-value tabular">{formatValue(g.value, unit)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
