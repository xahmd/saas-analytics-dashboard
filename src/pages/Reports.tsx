import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClipboardList, IconExternalLink, IconLock, IconPlus, IconSearch, IconUsers, IconWorld } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Avatar, Button, Modal, PaperBanner } from '../components/ui'
import type { Report } from '../data/workspace'
import { useApp } from '../state'

const TABS = ['All reports', 'My reports', 'Shared with me'] as const
type Tab = (typeof TABS)[number]

const ACCESS_ICON = { Private: IconLock, Team: IconUsers, Workspace: IconWorld }

export function Reports({ tab: initial }: { tab: Tab }) {
  const navigate = useNavigate()
  const { reports, addReport, toast } = useApp()
  const [tab, setTab] = useState<Tab>(initial)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const filtered = reports.filter((r) => {
    if (tab === 'My reports' && !r.mine) return false
    if (tab === 'Shared with me' && !r.shared) return false
    return r.name.toLowerCase().includes(query.trim().toLowerCase())
  })

  const selectTab = (t: Tab) => {
    setTab(t)
    if (t === 'My reports') navigate('/reports/mine', { replace: true })
    else if (t === 'All reports') navigate('/reports', { replace: true })
  }

  const create = () => {
    const report = addReport(name.trim() || 'Untitled report')
    setCreating(false)
    setName('')
    setTab('My reports')
    toast(`“${report.name}” created`)
  }

  return (
    <>
      <PageHeader title="Reports" />
      <div className="page rise">
        <PaperBanner
          title="Tell stories with reports"
          body="Save metrics views, add insights and share with your teammates."
          art="/illustrations/reports.png"
          actions={
            <>
              <Button variant="ink" icon={<IconPlus size={16} stroke={1.25} />} onClick={() => setCreating(true)}>
                Create report
              </Button>
              <Button variant="paper" icon={<IconExternalLink size={16} stroke={1.25} />} onClick={() => toast('Docs open in a new tab')}>
                Learn more
              </Button>
            </>
          }
        />

        <h1 className="page-h1">Reports</h1>

        <div className="toolbar is-filled">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t} type="button" className={`tab ${tab === t ? 'is-active' : ''}`} onClick={() => selectTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <label className="search">
            <IconSearch size={16} stroke={1.25} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
          </label>
        </div>

        <div className="table">
          <div className="table-head reports-grid">
            <span>Name</span>
            <span>Created by</span>
            <span>Access</span>
            <span>Last updated</span>
          </div>
          {filtered.map((r) => (
            <ReportRow key={r.id} report={r} onOpen={() => toast(`Opening “${r.name}”`)} />
          ))}
          {!filtered.length && (
            <div className="table-empty">
              <span>{query ? `No reports match “${query}”.` : 'No reports yet.'}</span>
              {!query && tab === 'My reports' && (
                <Button size="sm" icon={<IconPlus size={14} stroke={1.5} />} onClick={() => setCreating(true)}>
                  Create your first report
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={creating}
        title="New report"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="light" onClick={create}>
              Create report
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create()
          }}
        >
          <label className="field">
            <span className="field-label">Report name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly business review" />
          </label>
        </form>
      </Modal>
    </>
  )
}

function ReportRow({ report, onOpen }: { report: Report; onOpen: () => void }) {
  const AccessIcon = ACCESS_ICON[report.access]
  const owner = report.owner === 'You' ? 'LH' : report.owner.split(' ').map((p) => p[0]).join('')
  return (
    <button type="button" className="table-row reports-grid" onClick={onOpen}>
      <span className="cell-name">
        <IconClipboardList size={16} stroke={1.25} />
        <strong>{report.name}</strong>
      </span>
      <span className="cell-person">
        <Avatar id={owner} />
        {report.owner}
      </span>
      <span className="cell-access">
        <AccessIcon size={14} stroke={1.5} />
        {report.access}
      </span>
      <span className="muted">{report.updated}</span>
    </button>
  )
}
