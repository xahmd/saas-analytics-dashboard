import { Link } from 'react-router-dom'
import { IconCheck, IconChevronRight } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Button, PaperBanner } from '../components/ui'
import { DATA_SOURCES } from '../data/workspace'
import { useApp } from '../state'

export function DataSources() {
  const { demo, setDemo, connected, toast } = useApp()

  return (
    <>
      <PageHeader title="Data sources" />
      <div className="page page-narrow rise">
        <h1 className="page-h1">Data sources</h1>

        <PaperBanner
          compact
          title="Try Steep with demo data"
          body="Add demo metrics, reports, targets and team spaces in one click."
          art="/illustrations/data-sources.png"
          actions={
            <Button
              variant={demo ? 'paper' : 'ink'}
              icon={demo ? <IconCheck size={14} stroke={2} /> : undefined}
              onClick={() => {
                setDemo(!demo)
                toast(demo ? 'Demo data removed' : 'Demo data added to your workspace')
              }}
            >
              {demo ? 'Demo data on' : 'Try demo data'}
            </Button>
          }
        />

        <div className="page-intro">
          <h2 className="page-h2">Database</h2>
          <p className="muted">
            Build your semantic layer in Steep. Use your database with our query engine and define metrics in Steep, or
            sync your metrics from dbt Core.
          </p>
        </div>

        <div className="source-grid">
          {DATA_SOURCES.map((s) => {
            const Icon = s.icon
            return (
              <Link key={s.id} to={`/settings/data-sources/${s.id}`} className="source">
                <span className="source-logo" style={{ color: s.color }}>
                  <Icon size={36} stroke={1.25} />
                </span>
                <span className="source-text">
                  <strong>
                    {s.name}
                    {s.beta && <span className="badge">BETA</span>}
                  </strong>
                  <span>{s.vendor}</span>
                </span>
                {connected === s.id ? (
                  <span className="status-dot">Connected</span>
                ) : (
                  <IconChevronRight size={20} stroke={1.25} className="source-go" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
