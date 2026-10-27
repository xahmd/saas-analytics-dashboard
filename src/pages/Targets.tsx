import { useState } from 'react'
import { IconArrowRight, IconChevronDown, IconHelpCircle, IconTarget, IconX } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Menu } from '../components/ui'
import { TARGETS } from '../data/workspace'
import { useApp } from '../state'

const SHEETS = ['targets_sheet_v2', 'targets_sheet_v1', 'finance_budget_2024']

export function Targets() {
  const { toast } = useApp()
  const [sheet, setSheet] = useState<string | null>('targets_sheet_v2')

  return (
    <>
      <PageHeader title="Targets" />
      <div className="page page-narrow rise">
        <h1 className="page-h1">Targets</h1>

        <div className="select-row">
          <Menu
            align="start"
            trigger={(p) => (
              <button type="button" className="select" {...p}>
                <span className="select-label">Targets table</span>
                <span className="select-value">{sheet ?? 'Choose a table'}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </button>
            )}
            items={SHEETS.map((s) => ({ label: s, active: s === sheet, onSelect: () => setSheet(s) }))}
          />
          <button type="button" className="icon-btn is-boxed is-lg" aria-label="Clear targets table" onClick={() => setSheet(null)} disabled={!sheet}>
            <IconX size={18} stroke={1.25} />
          </button>
        </div>

        {sheet ? (
          TARGETS.map((set) => (
            <section key={set.name} className="target-card">
              <h3>
                <IconTarget size={18} stroke={1.5} />
                {set.name}
              </h3>
              <div className="target-table">
                <div className="target-row is-head">
                  <span>{sheet}</span>
                  <span>Time grain</span>
                  <span>From</span>
                  <span>
                    <IconArrowRight size={12} stroke={1.5} /> To
                  </span>
                </div>
                {set.rows.map((r) => (
                  <div key={r.metric} className="target-row">
                    <strong>{r.metric}</strong>
                    <span>{r.grain}</span>
                    <span>{r.from}</span>
                    <span>
                      <IconArrowRight size={12} stroke={1.5} className="muted" /> {r.to}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="empty">Choose a targets table to load your budgets.</p>
        )}

        <footer className="page-foot">
          <p className="muted">Targets need to be stored in a readable format in your database. Learn more about targets in our help section.</p>
          <button type="button" className="text-link" onClick={() => toast('Help center opens in a new tab')}>
            <IconHelpCircle size={16} stroke={1.5} /> Set up targets
          </button>
        </footer>
      </div>
    </>
  )
}
