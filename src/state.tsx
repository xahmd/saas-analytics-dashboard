import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { REPORTS, TEAMS, type Report, type Team } from './data/workspace'

type Toast = { id: number; text: string }

type AppState = {
  demo: boolean
  setDemo: (on: boolean) => void
  connected: string | null
  setConnected: (id: string) => void
  reports: Report[]
  addReport: (name: string) => Report
  teams: Team[]
  addTeam: (name: string) => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  navOpen: boolean
  setNavOpen: (open: boolean) => void
  toasts: Toast[]
  toast: (text: string) => void
}

const Ctx = createContext<AppState | null>(null)

const TEAM_COLORS = ['#c9b6f2', '#f2c6a0', '#a8d5e2', '#f4a9a0', '#b5e0b8']

export function AppProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(true)
  const [connected, setConnected] = useState<string | null>(null)
  const [reports, setReports] = useState(REPORTS)
  const [teams, setTeams] = useState(TEAMS)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const toast = useCallback((text: string) => {
    const id = nextId.current++
    setToasts((all) => [...all, { id, text }])
    window.setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 2600)
  }, [])

  const addReport = useCallback((name: string) => {
    const report: Report = {
      id: `r-${Date.now()}`,
      name,
      owner: 'You',
      access: 'Private',
      updated: 'Just now',
      mine: true,
      metrics: 0,
    }
    setReports((all) => [report, ...all])
    return report
  }, [])

  const addTeam = useCallback((name: string) => {
    setTeams((all) => [
      {
        id: `t-${Date.now()}`,
        name,
        initial: name.trim()[0]?.toUpperCase() ?? 'T',
        color: TEAM_COLORS[all.length % TEAM_COLORS.length],
        members: ['LH'],
        mine: true,
        metrics: 0,
      },
      ...all,
    ])
  }, [])

  const value = useMemo<AppState>(
    () => ({
      demo,
      setDemo,
      connected,
      setConnected,
      reports,
      addReport,
      teams,
      addTeam,
      paletteOpen,
      setPaletteOpen,
      navOpen,
      setNavOpen,
      toasts,
      toast,
    }),
    [demo, connected, reports, addReport, teams, addTeam, paletteOpen, navOpen, toasts, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
