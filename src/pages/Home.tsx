import { Link, useNavigate } from 'react-router-dom'
import { IconArrowRight, IconCheck, IconClipboardList } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Sparkline } from '../components/Sparkline'
import { Avatar, Button, SectionTitle } from '../components/ui'
import { metricBySlug, PINNED, pointsFor } from '../data/metrics'
import { formatDelta, formatValue } from '../data/format'
import { windowOf } from '../data/series'
import { useApp } from '../state'

export function Home() {
  const navigate = useNavigate()
  const { demo, setDemo, connected, reports, toast } = useApp()

  const steps = [
    { label: 'Explore the demo workspace', done: demo, to: '/metrics/cancelled-orders' },
    { label: 'Connect a data source', done: Boolean(connected), to: '/settings/data-sources' },
    { label: 'Define your first metric', done: false, to: '/metrics/registrations/edit' },
    { label: 'Invite your team', done: false, to: '/settings/members' },
  ]
  const done = steps.filter((s) => s.done).length

  return (
    <>
      <PageHeader title="Home" />
      <div className="page rise">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Tuesday, August 6</span>
            <h1 className="display">Get started!</h1>
            <p className="hero-lede">
              Connect your data source and define your metrics to unlock simple self-service analytics for everyone in
              your organisation.
            </p>
            <div className="hero-actions">
              <Button variant="light" size="lg" onClick={() => navigate('/settings/data-sources')}>
                Connect data source
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setDemo(true)
                  navigate('/metrics/cancelled-orders')
                }}
              >
                Try demo data
              </Button>
            </div>
          </div>
          <div className="hero-side">
            <img className="hero-art" src="/illustrations/flowers.png" alt="" />
            <div className="checklist">
              <div className="checklist-head">
                <strong>Setup</strong>
                <span className="tabular">
                  {done} of {steps.length}
                </span>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length}>
                <span style={{ width: `${(done / steps.length) * 100}%` }} />
              </div>
              <ol>
                {steps.map((s) => (
                  <li key={s.label}>
                    <Link to={s.to} className={`step ${s.done ? 'is-done' : ''}`}>
                      <span className="step-mark">{s.done && <IconCheck size={11} stroke={2.5} />}</span>
                      {s.label}
                      <IconArrowRight size={14} stroke={1.5} className="step-go" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle
            aside={
              <Link to="/metrics" className="text-link">
                Metrics catalog <IconArrowRight size={14} stroke={1.5} />
              </Link>
            }
          >
            Pinned metrics
          </SectionTitle>
          <div className="kpis">
            {PINNED.map((slug) => {
              const m = metricBySlug(slug)!
              const all = pointsFor(m)
              const recent = windowOf(all, 90)
              const now = recent.at(-1)!.v
              const before = recent.at(-31)!.v
              const up = now >= before
              const good = m.inverse ? !up : up
              return (
                <Link key={slug} to={`/metrics/${slug}`} className="kpi">
                  <div className="kpi-top">
                    <span className="kpi-name">{m.name}</span>
                    <span className={`delta ${good ? 'is-good' : 'is-bad'}`}>{formatDelta(now, before)}</span>
                  </div>
                  <span className="kpi-value tabular">{formatValue(now, m.unit)}</span>
                  <span className="kpi-sub">vs 30 days ago</span>
                  <Sparkline points={recent} color={good ? 'var(--blue)' : 'var(--rose)'} width={260} height={44} />
                </Link>
              )
            })}
          </div>
        </section>

        <section>
            <SectionTitle
              aside={
                <Link to="/reports" className="text-link">
                  All reports <IconArrowRight size={14} stroke={1.5} />
                </Link>
              }
            >
              Recent reports
            </SectionTitle>
            <ul className="list-card">
              {reports.slice(0, 4).map((r) => (
                <li key={r.id}>
                  <button type="button" className="list-row" onClick={() => toast(`Opening “${r.name}”`)}>
                    <span className="list-icon">
                      <IconClipboardList size={16} stroke={1.25} />
                    </span>
                    <span className="list-main">
                      <strong>{r.name}</strong>
                      <span>
                        {r.metrics} metrics, {r.access.toLowerCase()}
                      </span>
                    </span>
                    <Avatar id={ownerId(r.owner)} />
                    <span className="list-meta">{r.updated}</span>
                  </button>
                </li>
              ))}
            </ul>
        </section>
      </div>
    </>
  )
}

function ownerId(name: string) {
  if (name === 'You') return 'LH'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
}
