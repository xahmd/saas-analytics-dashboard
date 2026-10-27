import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowsJoin2, IconEye, IconExternalLink, IconPlus, IconTable, IconTrash } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Button, PaperBanner, SectionTitle } from '../components/ui'
import { DEMO_TABLES } from '../data/workspace'
import { useApp } from '../state'

type Join = { id: number; left: string; right: string; key: string }

export function TablesJoins() {
  const { demo, connected, toast } = useApp()
  const [joins, setJoins] = useState<Join[]>(demo ? [{ id: 1, left: 'orders', right: 'users', key: 'user_id' }] : [])
  const hasTables = demo || Boolean(connected)

  const addJoin = () =>
    setJoins((all) => [...all, { id: Date.now(), left: 'tickets', right: 'users', key: 'user_id' }])

  return (
    <>
      <PageHeader title="Tables & joins" />
      <div className="page page-narrow rise">
        <PaperBanner
          title="Tables & Joins"
          body="Get an overview of your database tables. Create and manage joins to use data from multiple tables in a single metric."
          art="/illustrations/tables.png"
          actions={
            <Button variant="ink" icon={<IconExternalLink size={16} stroke={1.25} />} onClick={() => toast('Docs open in a new tab')}>
              Learn more
            </Button>
          }
        />

        <section>
          <SectionTitle aside={<span className="muted">{joins.length}</span>}>Joins</SectionTitle>
          <div className="rows">
            {joins.map((j) => (
              <div key={j.id} className="row join-row">
                <IconArrowsJoin2 size={16} stroke={1.25} />
                <code>{j.left}</code>
                <span className="muted">joined to</span>
                <code>{j.right}</code>
                <span className="muted">on</span>
                <code>{j.key}</code>
                <button
                  type="button"
                  className="icon-btn push"
                  aria-label="Delete join"
                  onClick={() => setJoins((all) => all.filter((x) => x.id !== j.id))}
                >
                  <IconTrash size={14} stroke={1.5} />
                </button>
              </div>
            ))}
            <button type="button" className="row row-add" onClick={addJoin} disabled={!hasTables}>
              <IconPlus size={16} stroke={1.5} /> Create new join
            </button>
          </div>
        </section>

        <section>
          <SectionTitle aside={hasTables ? <span className="muted">{DEMO_TABLES.length}</span> : undefined}>Tables & views</SectionTitle>
          {hasTables ? (
            <div className="rows">
              {DEMO_TABLES.map((t) => (
                <div key={t.name} className="row table-item">
                  {t.kind === 'view' ? <IconEye size={16} stroke={1.25} /> : <IconTable size={16} stroke={1.25} />}
                  <code>{t.name}</code>
                  <span className="badge is-muted">{t.kind}</span>
                  <span className="muted push tabular">{t.columns} columns</span>
                  <span className="muted tabular table-rows">{t.rows} rows</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">
              <Link to="/settings/data-sources" className="text-link">
                Connect a database
              </Link>{' '}
              to view tables.
            </p>
          )}
        </section>
      </div>
    </>
  )
}
