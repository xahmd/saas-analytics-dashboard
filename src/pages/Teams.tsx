import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IconChartLine, IconExternalLink, IconLock, IconPlus } from '@tabler/icons-react'
import { PageHeader } from '../components/PageHeader'
import { AvatarStack, Button, Modal, PaperBanner, SectionTitle } from '../components/ui'
import type { Team } from '../data/workspace'
import { useApp } from '../state'

export function Teams() {
  const { teams, addTeam, toast } = useApp()
  const { hash } = useLocation()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (hash) document.getElementById(`team-${hash.slice(1)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [hash])

  const create = () => {
    if (!name.trim()) return
    addTeam(name.trim())
    toast(`Team “${name.trim()}” created`)
    setName('')
    setCreating(false)
  }

  const mine = teams.filter((t) => t.mine)
  const others = teams.filter((t) => !t.mine)

  return (
    <>
      <PageHeader title="Teams" />
      <div className="page rise">
        <PaperBanner
          title="Teams"
          body="Teams are our way to collaborate. Gather a group of people around your shared metrics and reports."
          art="/illustrations/teams.png"
          actions={
            <>
              <Button variant="ink" icon={<IconPlus size={16} stroke={1.25} />} onClick={() => setCreating(true)}>
                New team
              </Button>
              <Button variant="paper" icon={<IconExternalLink size={16} stroke={1.25} />} onClick={() => toast('Docs open in a new tab')}>
                Learn more
              </Button>
            </>
          }
        />

        <section>
          <SectionTitle aside={<span className="muted">{mine.length}</span>}>My teams</SectionTitle>
          <div className="team-grid">
            {mine.map((t) => (
              <TeamCard key={t.id} team={t} highlighted={hash === `#${t.id}`} />
            ))}
            {!mine.length && <p className="empty">No teams yet.</p>}
          </div>
        </section>

        <section>
          <SectionTitle aside={<span className="muted">{others.length}</span>}>Other teams</SectionTitle>
          <div className="team-grid">
            {others.map((t) => (
              <TeamCard key={t.id} team={t} onJoin={() => toast(`Request sent to join ${t.name}`)} />
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={creating}
        title="New team"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button variant="light" onClick={create} disabled={!name.trim()}>
              Create team
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
            <span className="field-label">Team name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing" />
          </label>
        </form>
      </Modal>
    </>
  )
}

function TeamCard({ team, onJoin, highlighted }: { team: Team; onJoin?: () => void; highlighted?: boolean }) {
  return (
    <article id={`team-${team.id}`} className={`team-card ${highlighted ? 'is-highlighted' : ''}`}>
      <div className="team-card-head">
        <span className="team-mark is-lg" style={{ background: team.color }}>
          {team.initial}
        </span>
        <div>
          <strong>
            {team.name}
            {team.locked && <IconLock size={12} stroke={1.5} />}
          </strong>
          <span>
            {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>
      <div className="team-card-foot">
        <AvatarStack ids={team.members} />
        <span className="team-metrics">
          <IconChartLine size={14} stroke={1.5} /> {team.metrics} metrics
        </span>
        {onJoin && (
          <Button size="sm" onClick={onJoin}>
            Join
          </Button>
        )}
      </div>
    </article>
  )
}
