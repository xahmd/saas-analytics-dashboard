import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconSearch, IconSquareRotatedFilled } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Sparkline } from '../components/Sparkline'
import { GROUPS, METRICS, pointsFor } from '../data/metrics'
import { formatDelta, formatValue } from '../data/format'
import { windowOf } from '../data/series'

export function MetricsCatalog() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<string>('All')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return METRICS.filter(
      (m) => (group === 'All' || m.group === group) && (!q || `${m.name} ${m.group} ${m.description}`.toLowerCase().includes(q)),
    )
  }, [query, group])

  const byGroup = GROUPS.map((g) => ({ g, items: visible.filter((m) => m.group === g) })).filter((x) => x.items.length)

  return (
    <>
      <PageHeader title="Metrics catalog" />
      <div className="page rise">
        <div className="page-intro">
          <h1 className="page-h1">Metrics</h1>
          <p className="muted">{METRICS.length} metrics defined across {GROUPS.length} groups. Every number in Steep starts here.</p>
        </div>

        <div className="toolbar">
          <div className="tabs">
            {['All', ...GROUPS].map((g) => (
              <button key={g} type="button" className={`tab ${group === g ? 'is-active' : ''}`} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <label className="search">
            <IconSearch size={16} stroke={1.25} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search metrics" />
          </label>
        </div>

        {byGroup.map(({ g, items }) => (
          <section key={g} className="catalog-group">
            <h3 className="catalog-title">
              {g} <span>{items.length}</span>
            </h3>
            <div className="table">
              {items.map((m) => {
                const pts = windowOf(pointsFor(m), 60)
                const now = pts.at(-1)!.v
                const before = pts[0].v
                const up = now >= before
                const good = m.inverse ? !up : up
                return (
                  <Link key={m.slug} to={`/metrics/${m.slug}`} className="table-row catalog-row">
                    <span className="catalog-name">
                      <IconSquareRotatedFilled size={10} className="nav-diamond" />
                      <span>
                        <strong>{m.name}</strong>
                        <small>{m.description}</small>
                      </span>
                    </span>
                    <Sparkline points={pts} color={good ? 'var(--blue)' : 'var(--rose)'} width={110} height={28} />
                    <span className="catalog-value tabular">{formatValue(now, m.unit, true)}</span>
                    <span className={`delta ${good ? 'is-good' : 'is-bad'}`}>{formatDelta(now, before)}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
        {!byGroup.length && <p className="empty">No metrics match “{query}”.</p>}
      </div>
    </>
  )
}
