import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconCalendarTime,
  IconChartBar,
  IconChartLine,
  IconChevronDown,
  IconClock,
  IconCopy,
  IconFilter,
  IconHash,
  IconLayoutGrid,
  IconLock,
  IconMathFunction,
  IconPlus,
  IconRefresh,
  IconSitemap,
} from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { LineChart } from '../components/LineChart'
import { Button, Chip, Menu, Segmented, Toggle } from '../components/ui'
import { metricBySlug, type Metric } from '../data/metrics'
import { fmtFull, formatValue } from '../data/format'
import { buildView, type Period } from '../data/view'
import { DEMO_TABLES } from '../data/workspace'
import { useApp } from '../state'

const AGGREGATIONS = ['Sum', 'Average', 'Count', 'Median', 'Ratio'] as const
const GRAINS = ['Week', 'Month', 'Quarter', '6M', 'Year', '2Y', '5Y'] as const satisfies readonly Period[]
const SQL_FN: Record<Metric['aggregation'], string> = {
  Sum: 'SUM',
  Average: 'AVG',
  Count: 'COUNT',
  Median: 'APPROX_QUANTILES',
  Ratio: 'AVG',
}

export function EditMetric() {
  const { slug } = useParams()
  const metric = metricBySlug(slug)
  if (!metric) return <Navigate to="/metrics" replace />
  return <Editor key={metric.slug} metric={metric} />
}

function Editor({ metric }: { metric: Metric }) {
  const navigate = useNavigate()
  const { toast } = useApp()
  const [name, setName] = useState(metric.name)
  const [aggregation, setAggregation] = useState<Metric['aggregation']>(metric.aggregation)
  const [table, setTable] = useState(metric.table)
  const [dimensions, setDimensions] = useState(metric.dimensions)
  const [isPrivate, setPrivate] = useState(false)
  const [description, setDescription] = useState(metric.description)
  const [period, setPeriod] = useState<Period>('Month')
  const [mode, setMode] = useState<'line' | 'bar'>('line')
  const [previewOpen, setPreviewOpen] = useState(true)
  const [queryOpen, setQueryOpen] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const view = useMemo(
    () => buildView(metric, { period, offset: 0, breakdown: null, filter: null, compareYear: false }),
    [metric, period],
  )
  const last = view.win.at(-1)!

  const sql = [
    'SELECT',
    `  CAST('${metric.time}' AS DATE) AS 'time',`,
    `  CAST(${SQL_FN[aggregation]}('${metric.value}') AS FLOAT64) AS 'metric'`,
    'FROM',
    `  'public_demo_v1.${table}'`,
    'GROUP BY 1',
    'ORDER BY 1',
  ]

  const save = () => {
    toast(`“${name}” saved`)
    navigate(`/metrics/${metric.slug}`)
  }

  const allDims = ['country', 'segment', 'platform', 'plan', 'source', 'device']

  return (
    <div className="explorer">
      <div className="explorer-main">
        <PageHeader
          title="Edit metric"
          back={`/metrics/${metric.slug}`}
          actions={
            <>
              <Button variant="ghost" onClick={() => navigate(`/metrics/${metric.slug}`)}>
                Cancel
              </Button>
              <Button variant="light" onClick={save}>
                Save
              </Button>
            </>
          }
        />
        <div className="editor-body rise">
          <div className="editor-head">
            <h2>Preview</h2>
            <Button
              icon={<IconRefresh size={16} stroke={1.25} />}
              onClick={() => {
                setRefreshKey((k) => k + 1)
                toast('Preview refreshed')
              }}
            >
              Refresh
            </Button>
          </div>

          <section className="card">
            <header className="card-head">
              <button type="button" className="card-toggle" aria-expanded={previewOpen} onClick={() => setPreviewOpen((o) => !o)}>
                <IconChevronDown size={16} stroke={1.5} className={previewOpen ? '' : 'is-collapsed'} />
                {name || 'Untitled metric'}
              </button>
              <div className="mini-toggle">
                <button type="button" className={mode === 'bar' ? 'is-active' : ''} onClick={() => setMode('bar')} aria-label="Bar chart">
                  <IconChartBar size={16} stroke={1.25} />
                </button>
                <button type="button" className={mode === 'line' ? 'is-active' : ''} onClick={() => setMode('line')} aria-label="Line chart">
                  <IconChartLine size={16} stroke={1.25} />
                </button>
              </div>
            </header>
            {previewOpen && (
              <div className="card-body" key={refreshKey}>
                <div className="stat stat-lg">
                  <span className="stat-label">{fmtFull(last.t)}</span>
                  <span className="stat-value tabular">{formatValue(last.v, metric.unit)}</span>
                </div>
                <LineChart series={view.series} unit={metric.unit} mode={mode} minHeight={240} />
                <div className="center">
                  <Segmented options={GRAINS} value={period} onChange={setPeriod} size="lg" />
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <header className="card-head">
              <button type="button" className="card-toggle" aria-expanded={queryOpen} onClick={() => setQueryOpen((o) => !o)}>
                <IconChevronDown size={16} stroke={1.5} className={queryOpen ? '' : 'is-collapsed'} />
                Query
              </button>
              <Button
                variant="ghost"
                icon={<IconCopy size={16} stroke={1.25} />}
                onClick={() => {
                  navigator.clipboard?.writeText(sql.join('\n'))
                  toast('Query copied to clipboard')
                }}
              >
                Copy to clipboard
              </Button>
            </header>
            {queryOpen && (
              <pre className="code">
                {sql.map((line, i) => (
                  <div key={i} className="code-line">
                    <span className="code-num">{i + 1}</span>
                    <code>{highlight(line)}</code>
                  </div>
                ))}
              </pre>
            )}
          </section>
        </div>
      </div>

      <aside className="panel">
        <div className="panel-block">
          <Menu
            align="start"
            trigger={(p) => (
              <button type="button" className="agg-select" {...p}>
                <span className="agg-dot">
                  <IconMathFunction size={12} stroke={2} />
                </span>
                {aggregation}
                <IconChevronDown size={16} stroke={1.5} className="push" />
              </button>
            )}
            items={AGGREGATIONS.map((a) => ({ label: a, active: a === aggregation, onSelect: () => setAggregation(a) }))}
          />
          <label className="field">
            <span className="field-label">Metric name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </div>

        <div className="panel-block props">
          <Prop icon={<IconLayoutGrid size={16} stroke={1.25} />} label="Table">
            <Menu
              trigger={(p) => (
                <button type="button" className="chip chip-blue chip-btn" {...p}>
                  {table}
                </button>
              )}
              items={DEMO_TABLES.filter((t) => t.kind === 'table').map((t) => {
                const short = t.name.split('.')[1]
                return { label: short, active: short === table, onSelect: () => setTable(short) }
              })}
            />
          </Prop>
          <Prop icon={<IconHash size={16} stroke={1.25} />} label="Value">
            <Chip>{metric.value}</Chip>
          </Prop>
          <Prop icon={<IconClock size={16} stroke={1.25} />} label="Time">
            <Chip>{metric.time}</Chip>
          </Prop>
          <Prop icon={<IconSitemap size={16} stroke={1.25} />} label="Dimensions">
            <div className="chips is-end">
              {dimensions.map((d) => (
                <Chip key={d} onRemove={() => setDimensions((all) => all.filter((x) => x !== d))}>
                  {d}
                </Chip>
              ))}
              <Menu
                trigger={(p) => (
                  <button type="button" className="icon-btn is-small" aria-label="Add dimension" {...p}>
                    <IconPlus size={14} stroke={1.5} />
                  </button>
                )}
                items={allDims
                  .filter((d) => !dimensions.includes(d))
                  .map((d) => ({ label: d, onSelect: () => setDimensions((all) => [...all, d]) }))}
              />
            </div>
          </Prop>
          <Prop icon={<IconFilter size={16} stroke={1.25} />} label="Filter">
            <span className="muted">None</span>
          </Prop>
          <Prop icon={<IconCalendarTime size={16} stroke={1.25} />} label="Time grains">
            <Chip>All</Chip>
          </Prop>
          <Prop icon={<IconLock size={16} stroke={1.25} />} label="Private">
            <Toggle checked={isPrivate} onChange={setPrivate} label="Private metric" />
          </Prop>
        </div>

        <div className="panel-row">
          <span className="panel-row-label strong">Cohorts</span>
          <button type="button" className="icon-btn push" aria-label="Add cohort" onClick={() => toast('Cohorts are coming soon')}>
            <IconPlus size={16} stroke={1.5} />
          </button>
        </div>
        <div className="panel-section">
          <span className="panel-row-label strong">Slices</span>
          <button type="button" className="link-btn" onClick={() => toast('Slice added')}>
            <IconPlus size={16} stroke={1.5} /> Add slice
          </button>
        </div>
        <div className="panel-section">
          <span className="panel-row-label strong">Description</span>
          <span className="muted">Shown next to the metric in view mode.</span>
          <textarea className="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </aside>
    </div>
  )
}

function Prop({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="prop">
      {icon}
      <span className="prop-label">{label}</span>
      <div className="prop-value">{children}</div>
    </div>
  )
}

const TOKEN = /('[^']*')|\b(SELECT|FROM|AS|GROUP BY|ORDER BY|WHERE|CAST)\b|\b(DATE|FLOAT64)\b|\b(SUM|AVG|COUNT|APPROX_QUANTILES)\b|(\d+)/g

function highlight(line: string) {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const cls = m[1] ? 'tok-str' : m[2] ? 'tok-kw' : m[3] ? 'tok-type' : m[4] ? 'tok-fn' : 'tok-num'
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}
