import { useId } from 'react'
import type { Point } from '../data/series'

type Props = { points: Point[]; color: string; width?: number; height?: number }

export function Sparkline({ points, color, width = 120, height = 36 }: Props) {
  const id = useId()
  if (points.length < 2) return null
  const values = points.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const coords = points.map((p, i) => [i * step, height - 3 - ((p.v - min) / range) * (height - 6)] as const)
  const d = coords.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
  const [lx, ly] = coords[coords.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="spark" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d}L${width},${height}L0,${height}Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.4} fill={color} />
    </svg>
  )
}
