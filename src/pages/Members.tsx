import { useState } from 'react'
import { IconChevronDown, IconMail } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { Avatar, Button, Menu } from '../components/ui'
import { MEMBERS, PEOPLE } from '../data/workspace'
import { useApp } from '../state'

const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer']

export function Members() {
  const { toast } = useApp()
  const [members, setMembers] = useState(MEMBERS)
  const [email, setEmail] = useState('')

  const invite = () => {
    if (!email.includes('@')) return
    toast(`Invite sent to ${email}`)
    setEmail('')
  }

  return (
    <>
      <PageHeader title="Members" />
      <div className="page page-narrow rise">
        <div className="page-intro">
          <h1 className="page-h1">Members</h1>
          <p className="muted">{members.length} people in SaaS By Ahmed.</p>
        </div>

        <form
          className="invite"
          onSubmit={(e) => {
            e.preventDefault()
            invite()
          }}
        >
          <label className="search is-grow">
            <IconMail size={16} stroke={1.25} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
          </label>
          <Button type="submit" variant="light" disabled={!email.includes('@')}>
            Send invite
          </Button>
        </form>

        <div className="table">
          <div className="table-head members-grid">
            <span>Name</span>
            <span>Role</span>
            <span>Last active</span>
          </div>
          {members.map((m) => (
            <div key={m.id} className="table-row members-grid">
              <span className="cell-person">
                <Avatar id={m.id} size={28} />
                <span className="stack">
                  <strong>{PEOPLE[m.id].name}</strong>
                  <span className="muted">{m.email}</span>
                </span>
              </span>
              <Menu
                align="start"
                trigger={(p) => (
                  <button type="button" className="panel-select" disabled={m.role === 'Owner'} {...p}>
                    {m.role}
                    {m.role !== 'Owner' && <IconChevronDown size={14} stroke={1.5} />}
                  </button>
                )}
                items={ROLES.slice(1).map((r) => ({
                  label: r,
                  active: r === m.role,
                  onSelect: () => setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, role: r } : x))),
                }))}
              />
              <span className="muted">{m.active}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
