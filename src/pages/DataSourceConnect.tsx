import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconCircleCheck, IconEye, IconEyeOff, IconHelpCircle, IconLoader2 } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/ui'
import { DATA_SOURCES, type DataSource } from '../data/workspace'
import { useApp } from '../state'

export function DataSourceConnect() {
  const { id } = useParams()
  const source = DATA_SOURCES.find((s) => s.id === id)
  if (!source) return <Navigate to="/settings/data-sources" replace />
  return <ConnectForm key={source.id} source={source} />
}

type Status = 'idle' | 'testing' | 'ok'

function ConnectForm({ source }: { source: DataSource }) {
  const navigate = useNavigate()
  const { connected, setConnected, toast } = useApp()
  const [values, setValues] = useState<Record<string, string>>({})
  const [reveal, setReveal] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<Status>(connected === source.id ? 'ok' : 'idle')
  const Icon = source.icon

  const filled = source.fields.filter((f) => values[f.key]?.trim()).length
  const complete = filled === source.fields.length

  const test = () => {
    setStatus('testing')
    window.setTimeout(() => {
      setStatus('ok')
      setConnected(source.id)
      toast(`${source.name} connected`)
    }, 1400)
  }

  return (
    <>
      <PageHeader title={`Data source / ${source.name}`} back="/settings/data-sources" />
      <div className="page page-narrow rise">
        <div className="connect-head">
          <span className="source-logo is-lg" style={{ color: source.color }}>
            <Icon size={40} stroke={1.25} />
          </span>
          <div>
            <h1 className="page-h1">{source.name}</h1>
            <p className="muted">{source.name} connection details</p>
          </div>
        </div>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault()
            if (complete && status === 'idle') test()
          }}
        >
          {source.fields.map((f) => (
            <label key={f.key} className="field field-lg">
              <span className="field-label">{f.label}</span>
              <input
                type={f.secret && !reveal[f.key] ? 'password' : 'text'}
                value={values[f.key] ?? ''}
                placeholder={f.hint}
                autoComplete="off"
                disabled={status !== 'idle'}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
              {f.secret && (
                <button
                  type="button"
                  className="icon-btn field-action"
                  aria-label={reveal[f.key] ? 'Hide' : 'Show'}
                  onClick={() => setReveal((r) => ({ ...r, [f.key]: !r[f.key] }))}
                >
                  {reveal[f.key] ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
                </button>
              )}
            </label>
          ))}

          <div className={`test-panel is-${status}`}>
            {status === 'ok' ? (
              <>
                <div className="test-ok">
                  <IconCircleCheck size={20} stroke={1.5} />
                  <div>
                    <strong>Connection verified</strong>
                    <span>Steep can read from {source.name}. Your tables will appear in Tables & joins.</span>
                  </div>
                </div>
                <Button variant="light" onClick={() => navigate('/settings/tables')}>
                  View tables
                </Button>
              </>
            ) : (
              <>
                <div className="test-copy">
                  <span>Test and save your data source connection.</span>
                  <span className="muted tabular">
                    {filled}/{source.fields.length} fields
                  </span>
                </div>
                <Button
                  type="submit"
                  variant={complete ? 'light' : 'outline'}
                  disabled={!complete || status === 'testing'}
                  icon={status === 'testing' ? <IconLoader2 size={14} className="spin" /> : undefined}
                >
                  {status === 'testing' ? 'Testing connection…' : 'Continue'}
                </Button>
              </>
            )}
          </div>
        </form>

        <footer className="page-foot">
          <p className="muted">
            You need an existing database or semantic API in order to use Steep. Learn more about connecting your data
            source in our help section.
          </p>
          <button type="button" className="text-link" onClick={() => toast('Help center opens in a new tab')}>
            <IconHelpCircle size={16} stroke={1.5} /> Connect your data source
          </button>
        </footer>
      </div>
    </>
  )
}
