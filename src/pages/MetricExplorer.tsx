import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconChartBar,
  IconChartLine,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconFilePlus,
  IconFilter,
  IconLayersDifference,
  IconOctahedron,
  IconPlus,
  IconSitemap,
  IconUpload,
} from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { LineChart } from '../components/LineChart'
import { Avatar, Button, Chip, Menu, Segmented } from '../components/ui'
import { dimensionValues, METRICS, metricBySlug, type Metric } from '../data/metrics'
import { fmtDay, fmtFull, formatDelta, formatValue } from '../data/format'
import { buildView, canGoBack, PERIOD_LABEL, PERIODS, type Period } from '../data/view'
import { PEOPLE } from '../data/workspace'
import { useApp } from '../state'

type Guide = 'Min' | 'Max' | 'Average'
type Tab = 'Explore' | 'About' | 'Comments'

const SEED_COMMENTS = [
  { who: 'KM', when: 'Aug 5', text: 'The jump on Jul 29 lines up with the warehouse sync outage. Flagged to ops.' },
  { who: 'RA', when: 'Aug 6', text: 'Can we break this down by reason before Thursday’s review?' },
]

export function MetricExplorer() {
  const { slug } = useParams()
  const metric = metricBySlug(slug)
  if (!metric) return <Navigate to="/metrics" replace />
  return <Explorer key={metric.slug} metric={metric} />
}

function Explorer({ metric }: { metric: Metric }) {
  const navigate = useNavigate()
  const { demo, reports, toast } = useApp()
  const [period, setPeriod] = useState<Period>(metric.slug === 'activation' ? '6M' : 'Quarter')
  const [offset, setOffset] = useState(0)
  const [mode, setMode] = useState<'line' | 'bar'>('line')
  const [tab, setTab] = useState<Tab>('Explore')
  const [compareYear, setCompareYear] = useState(metric.slug === 'cancelled-orders')
  const [guides, setGuides] = useState<Guide[]>(metric.slug === 'cancelled-orders' ? ['Min'] : [])
  const [breakdown, setBreakdown] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ dimension: string; value: string } | null>(null)
  const [comments, setComments] = useState(SEED_COMMENTS)
  const [draft, setDraft] = useState('')

  const changePeriod = (p: Period) => {
    setPeriod(p)
    setOffset(0)
  }

  const view = useMemo(
    () => buildView(metric, { period, offset, breakdown, filter, compareYear }),
    [metric, period, offset, breakdown, filter, compareYear],
  )

  const values = view.win.map((p) => p.v)
  const stats = {
    Min: Math.min(...values),
    Max: Math.max(...values),
    Average: values.reduce((s, v) => s + v, 0) / values.length,
  }
  const current = view.series[0].points.at(-1)!
  const last = view.win.at(-1)!
  const prevLast = view.prev.at(-1)
  const rangeLabel = offset === 0 ? PERIOD_LABEL[period] : `${fmtDay(view.win[0].t)} – ${fmtDay(last.t)}`

  const toggleGuide = (g: Guide) => setGuides((all) => (all.includes(g) ? all.filter((x) => x !== g) : [...all, g]))
  const compareOptions = [
    { label: 'Previous year', active: compareYear, onSelect: () => setCompareYear((v) => !v) },
    ...(['Min', 'Max', 'Average'] as Guide[]).map((g) => ({ label: g, active: guides.includes(g), onSelect: () => toggleGuide(g) })),
  ]

  const related = METRICS.filter((m) => m.group === metric.group && m.slug !== metric.slug).slice(0, 4)

  return (
    <div className="explorer">
      <div className="explorer-main">
        <PageHeader back="/metrics">
          <div className="grow" />
          <Menu
            trigger={(p) => (
              <button type="button" className="btn btn-ghost btn-md" {...p}>
                <span>{breakdown ? `Slice: ${breakdown}` : 'Slice'}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </button>
            )}
            items={[
              { label: 'None', active: !breakdown, onSelect: () => setBreakdown(null) },
              ...metric.dimensions.map((d) => ({ label: d, active: breakdown === d, onSelect: () => setBreakdown(d) })),
            ]}
          />
          <Menu
            trigger={(p) => (
              <Button icon={<IconFilePlus size={16} stroke={1.25} />} {...p}>
                Add to report
              </Button>
            )}
            items={reports.slice(0, 5).map((r) => ({
              label: r.name,
              onSelect: () => toast(`${metric.name} added to “${r.name}”`),
            }))}
          />
          <button type="button" className="icon-btn" aria-label="Share" onClick={() => toast('Share link copied')}>
            <IconUpload size={16} stroke={1.25} />
          </button>
        </PageHeader>

        <div className="explorer-body rise">
          <div className="explorer-title">
            <h2>{metric.name}</h2>
            {demo && <span className="pill">DEMO</span>}
            <span className="explorer-date">{fmtFull(last.t)}</span>
          </div>

          <div className="stat-strip">
            <div className="stat">
              <span className="stat-label">{breakdown ? view.series[0].label : metric.name}</span>
              <span className="stat-value tabular">{formatValue(current.v, metric.unit)}</span>
            </div>
            {prevLast && (
              <div className="stat is-rose">
                <span className="stat-label">
                  <b className={deltaClass(last.v, prevLast.v, metric.inverse)}>{formatDelta(last.v, prevLast.v)}</b> vs Prev. year
                </span>
                <span className="stat-sub tabular">
                  {formatValue(prevLast.v, metric.unit)} on {fmtFull(yearBefore(prevLast.t))}
                </span>
              </div>
            )}
            {guides.map((g) => (
              <div key={g} className="stat is-guide">
                <span className="stat-label">
                  <b>{formatDelta(last.v, stats[g])}</b> vs {g}
                </span>
                <span className="stat-sub tabular">{formatValue(stats[g], metric.unit)}</span>
              </div>
            ))}
          </div>

          <LineChart
            series={view.series}
            unit={metric.unit}
            mode={mode}
            guides={guides.map((g) => ({ label: g, value: stats[g] }))}
          />
        </div>

        <footer className="explorer-foot">
          <Segmented options={PERIODS} value={period} onChange={changePeriod} size="lg" />
          <div className="grow" />
          <div className="range">
            <button
              type="button"
              aria-label="Previous range"
              disabled={!canGoBack(period, offset)}
              onClick={() => setOffset((o) => o + 1)}
            >
              <IconChevronLeft size={16} stroke={1.5} />
            </button>
            <span className="range-label tabular">{rangeLabel}</span>
            <button type="button" aria-label="Next range" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)}>
              <IconChevronRight size={16} stroke={1.5} />
            </button>
          </div>
          <button
            type="button"
            className={`icon-btn is-boxed ${mode === 'bar' ? 'is-on' : ''}`}
            aria-label="Toggle bar chart"
            aria-pressed={mode === 'bar'}
            onClick={() => setMode((m) => (m === 'bar' ? 'line' : 'bar'))}
          >
            <IconChartBar size={16} stroke={1.25} />
          </button>
        </footer>
      </div>

      <aside className="panel">
        <div className="panel-block">
          <div className="panel-tabs">
            {(['Explore', 'About', 'Comments'] as Tab[]).map((t) => (
              <button key={t} type="button" className={`panel-tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
                {t}
                {t === 'Comments' && <span className="count">{comments.length}</span>}
              </button>
            ))}
            <Button size="sm" onClick={() => navigate(`/metrics/${metric.slug}/edit`)}>
              Edit
            </Button>
          </div>
          {tab === 'Explore' && (
            <div className="viz-toggle">
              <button type="button" className={mode === 'line' ? 'is-active' : ''} onClick={() => setMode('line')} aria-label="Line chart">
                <IconChartLine size={20} stroke={1} />
              </button>
              <button type="button" className={mode === 'bar' ? 'is-active' : ''} onClick={() => setMode('bar')} aria-label="Bar chart">
                <IconChartBar size={20} stroke={1} />
              </button>
            </div>
          )}
        </div>

        {tab === 'Explore' && (
          <>
            <div className="panel-row">
              <IconSitemap size={16} stroke={1.25} />
              <span className="panel-row-label">Breakdown</span>
              <Menu
                trigger={(p) => (
                  <button type="button" className="panel-select" {...p}>
                    {breakdown ?? 'None'}
                    <IconChevronDown size={14} stroke={1.5} />
                  </button>
                )}
                items={[
                  { label: 'None', active: !breakdown, onSelect: () => setBreakdown(null) },
                  ...metric.dimensions.map((d) => ({ label: d, active: breakdown === d, onSelect: () => setBreakdown(d) })),
                ]}
              />
            </div>

            <div className="panel-section">
              <div className="panel-row is-flush">
                <IconFilter size={16} stroke={1.25} />
                <span className="panel-row-label">Filter</span>
                <Menu
                  trigger={(p) => (
                    <button type="button" className="icon-btn" aria-label="Add filter" {...p}>
                      <IconPlus size={16} stroke={1.5} />
                    </button>
                  )}
                  items={metric.dimensions.flatMap((d) =>
                    dimensionValues(d).map((v) => ({
                      label: `${d} = ${v}`,
                      active: filter?.value === v,
                      onSelect: () => setFilter({ dimension: d, value: v }),
                    })),
                  )}
                />
              </div>
              {filter && (
                <div className="chips">
                  <Chip tone="neutral" onRemove={() => setFilter(null)}>
                    {filter.dimension}: {filter.value}
                  </Chip>
                </div>
              )}
            </div>

            <div className="panel-section">
              <div className="panel-row is-flush">
                <IconLayersDifference size={16} stroke={1.25} />
                <span className="panel-row-label">Compare</span>
                <Menu
                  trigger={(p) => (
                    <button type="button" className="icon-btn" aria-label="Add comparison" {...p}>
                      <IconPlus size={16} stroke={1.5} />
                    </button>
                  )}
                  items={compareOptions}
                />
              </div>
              {(compareYear || guides.length > 0) && (
                <div className="chips">
                  {compareYear && (
                    <Chip tone="rose" onRemove={() => setCompareYear(false)}>
                      Previous year
                    </Chip>
                  )}
                  {guides.map((g) => (
                    <Chip key={g} onRemove={() => toggleGuide(g)}>
                      {g}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            <div className="panel-section">
              <div className="panel-row is-flush">
                <IconOctahedron size={16} stroke={1.25} />
                <span className="panel-row-label">Related metrics</span>
              </div>
              <ul className="related">
                {related.map((m) => (
                  <li key={m.slug}>
                    <Link to={`/metrics/${m.slug}`}>
                      {m.name}
                      <IconChevronRight size={14} stroke={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {tab === 'About' && (
          <div className="panel-section about">
            <p className="about-desc">{metric.description}</p>
            <dl className="defs">
              <dt>Table</dt>
              <dd>
                <code>{metric.table}</code>
              </dd>
              <dt>Value</dt>
              <dd>
                <code>{metric.value}</code>
              </dd>
              <dt>Time</dt>
              <dd>
                <code>{metric.time}</code>
              </dd>
              <dt>Aggregation</dt>
              <dd>{metric.aggregation}</dd>
              <dt>Dimensions</dt>
              <dd>{metric.dimensions.join(', ')}</dd>
              <dt>Direction</dt>
              <dd>{metric.inverse ? 'Lower is better' : 'Higher is better'}</dd>
            </dl>
            <div className="owner">
              <Avatar id={initials(metric.owner)} size={26} />
              <div>
                <strong>{metric.owner}</strong>
                <span>Metric owner</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'Comments' && (
          <div className="panel-section comments">
            {comments.map((c, i) => (
              <article key={i} className="comment">
                <Avatar id={c.who} size={24} />
                <div>
                  <header>
                    <strong>{c.who === 'LH' ? 'You' : nameOf(c.who)}</strong>
                    <span>{c.when}</span>
                  </header>
                  <p>{c.text}</p>
                </div>
              </article>
            ))}
            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault()
                if (!draft.trim()) return
                setComments((all) => [...all, { who: 'LH', when: 'Just now', text: draft.trim() }])
                setDraft('')
              }}
            >
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment…" rows={3} />
              <Button type="submit" variant="light" size="sm" disabled={!draft.trim()}>
                Comment
              </Button>
            </form>
          </div>
        )}
      </aside>
    </div>
  )
}

function yearBefore(t: number) {
  const d = new Date(t)
  d.setFullYear(d.getFullYear() - 1)
  return d.getTime()
}

function deltaClass(current: number, previous: number, inverse?: boolean) {
  const up = current >= previous
  return (up ? !inverse : inverse) ? 'is-good' : 'is-bad'
}

const nameOf = (id: string) => PEOPLE[id]?.name ?? id
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
