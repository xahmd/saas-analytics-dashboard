import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  IconAdjustmentsHorizontal,
  IconBuilding,
  IconChevronDown,
  IconChevronRight,
  IconClipboardList,
  IconCreditCard,
  IconDatabase,
  IconHelpOctagon,
  IconLayoutGrid,
  IconLock,
  IconPuzzle,
  IconSelector,
  IconSmartHome,
  IconSquareRotatedFilled,
  IconStack2,
  IconTable,
  IconTarget,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { GROUPS, METRICS } from '../data/metrics'
import { useApp } from '../state'
import { Menu } from './ui'

const ICON = { size: 16, stroke: 1.25 }

const SETTINGS = [
  { to: '/settings/data-sources', label: 'Data sources', icon: IconDatabase },
  { to: '/settings/tables', label: 'Tables & joins', icon: IconTable },
  { to: '/settings/targets', label: 'Targets', icon: IconTarget },
  { to: '/settings/members', label: 'Members', icon: IconUsers },
  { to: '/settings/integrations', label: 'Integrations', icon: IconPuzzle },
  { to: '/settings/upgrade', label: 'Upgrade', icon: IconCreditCard },
  { to: '/settings/workspace', label: 'Workspace', icon: IconBuilding },
]

function Item({ to, icon, children, end, depth = 0 }: { to: string; icon?: ReactNode; children: ReactNode; end?: boolean; depth?: number }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item depth-${depth} ${isActive ? 'is-active' : ''}`}>
      {icon}
      <span className="nav-label">{children}</span>
    </NavLink>
  )
}

function Group({
  label,
  icon,
  open,
  onToggle,
  children,
}: {
  label: string
  icon?: ReactNode
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="nav-group">
      <button type="button" className="nav-item" aria-expanded={open} onClick={onToggle}>
        {icon ?? (open ? <IconChevronDown {...ICON} stroke={1.5} /> : <IconChevronRight {...ICON} stroke={1.5} />)}
        <span className="nav-label">{label}</span>
        {icon && (open ? <IconChevronDown size={14} stroke={1.5} /> : <IconChevronRight size={14} stroke={1.5} />)}
      </button>
      {open && <div className="nav-children">{children}</div>}
    </div>
  )
}

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { teams, navOpen, setNavOpen, toast } = useApp()

  const activeGroup = METRICS.find((m) => pathname.startsWith(`/metrics/${m.slug}`))?.group
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/settings'))
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : ['Engagement']))

  useEffect(() => {
    if (pathname.startsWith('/settings')) setSettingsOpen(true)
    if (activeGroup) setOpenGroups((s) => (s.has(activeGroup) ? s : new Set(s).add(activeGroup)))
    setNavOpen(false)
  }, [pathname, activeGroup, setNavOpen])

  const toggleGroup = (g: string) =>
    setOpenGroups((s) => {
      const next = new Set(s)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })

  const myTeams = teams.filter((t) => t.mine)

  return (
    <>
      <div className={`nav-scrim ${navOpen ? 'is-open' : ''}`} onClick={() => setNavOpen(false)} />
      <aside className={`sidebar ${navOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-head">
          <div className="sidebar-head-row">
            <Menu
              align="start"
              trigger={(p) => (
                <button type="button" className="workspace" {...p}>
                  <span className="workspace-mark">SA</span>
                  <span className="workspace-name">SaaS By Ahmed</span>
                  <IconSelector size={14} stroke={1.5} className="workspace-caret" />
                </button>
              )}
              items={[
                { label: 'Workspace settings', onSelect: () => navigate('/settings/workspace') },
                { label: 'Invite members', onSelect: () => navigate('/settings/members') },
                { label: 'Upgrade plan', onSelect: () => navigate('/settings/upgrade') },
                { label: 'Sign out', onSelect: () => navigate('/signin') },
              ]}
            />
            <button type="button" className="icon-btn sidebar-close" onClick={() => setNavOpen(false)} aria-label="Close navigation">
              <IconX size={16} stroke={1.5} />
            </button>
          </div>
        </div>

        <nav className="nav">
          <Item to="/" end icon={<IconSmartHome {...ICON} />}>
            Home
          </Item>
          <Group
            label="Settings"
            icon={<IconAdjustmentsHorizontal {...ICON} />}
            open={settingsOpen}
            onToggle={() => setSettingsOpen((o) => !o)}
          >
            {SETTINGS.map(({ to, label, icon: Icon }) => (
              <Item key={to} to={to} icon={<Icon {...ICON} />} depth={1}>
                {label}
              </Item>
            ))}
          </Group>
          <button type="button" className="nav-item" onClick={() => toast('Help center opens in a new tab')}>
            <IconHelpOctagon {...ICON} />
            <span className="nav-label">Help center</span>
          </button>

          <div className="nav-section">Teams</div>
          <Item to="/teams" end icon={<IconLayoutGrid {...ICON} />}>
            All teams
          </Item>
          {myTeams.map((t) => (
            <Link key={t.id} to={`/teams#${t.id}`} className="nav-item">
              <span className="team-mark" style={{ background: t.color }}>
                {t.initial}
              </span>
              <span className="nav-label">{t.name}</span>
              {t.locked && <IconLock size={12} stroke={1.5} className="nav-trail" />}
            </Link>
          ))}

          <div className="nav-section">Reports</div>
          <Item to="/reports" end icon={<IconClipboardList {...ICON} />}>
            All reports
          </Item>
          <Item to="/reports/mine" icon={<IconUser {...ICON} />}>
            My reports
          </Item>

          <div className="nav-section">Metrics</div>
          <Item to="/metrics" end icon={<IconStack2 {...ICON} />}>
            Metrics catalog
          </Item>
          {GROUPS.map((g) => (
            <Group key={g} label={g} open={openGroups.has(g)} onToggle={() => toggleGroup(g)}>
              {METRICS.filter((m) => m.group === g).map((m) => (
                <Item key={m.slug} to={`/metrics/${m.slug}`} depth={2} icon={<IconSquareRotatedFilled size={10} className="nav-diamond" />}>
                  {m.name}
                </Item>
              ))}
            </Group>
          ))}
        </nav>

      </aside>
    </>
  )
}
