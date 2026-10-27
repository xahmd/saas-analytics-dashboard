import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconCornerDownLeft, IconSearch, IconSquareRotatedFilled } from '@tabler/icons-react'
import { METRICS } from '../data/metrics'
import { useApp } from '../state'

type Entry = { label: string; hint: string; to: string; metric?: boolean }

const PAGES: Entry[] = [
  { label: 'Home', hint: 'Overview', to: '/' },
  { label: 'Metrics catalog', hint: 'Metrics', to: '/metrics' },
  { label: 'All reports', hint: 'Reports', to: '/reports' },
  { label: 'My reports', hint: 'Reports', to: '/reports/mine' },
  { label: 'All teams', hint: 'Teams', to: '/teams' },
  { label: 'Data sources', hint: 'Settings', to: '/settings/data-sources' },
  { label: 'Tables & joins', hint: 'Settings', to: '/settings/tables' },
  { label: 'Targets', hint: 'Settings', to: '/settings/targets' },
  { label: 'Members', hint: 'Settings', to: '/settings/members' },
  { label: 'Sign in screen', hint: 'Account', to: '/signin' },
]

const ENTRIES: Entry[] = [
  ...PAGES,
  ...METRICS.map((m) => ({ label: m.name, hint: m.group, to: `/metrics/${m.slug}`, metric: true })),
]

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(!paletteOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen, setPaletteOpen])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      setCursor(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [paletteOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ENTRIES.slice(0, 9)
    return ENTRIES.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(q)).slice(0, 12)
  }, [query])

  if (!paletteOpen) return null

  const go = (entry: Entry | undefined) => {
    if (!entry) return
    setPaletteOpen(false)
    navigate(entry.to)
  }

  return (
    <div className="overlay overlay-top" onMouseDown={() => setPaletteOpen(false)}>
      <div className="palette" role="dialog" aria-modal aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <label className="palette-input">
          <IconSearch size={16} stroke={1.5} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search metrics, reports and settings…"
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setCursor((c) => Math.min(results.length - 1, c + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setCursor((c) => Math.max(0, c - 1))
              } else if (e.key === 'Enter') {
                go(results[cursor])
              } else if (e.key === 'Escape') {
                setPaletteOpen(false)
              }
            }}
          />
          <kbd>Esc</kbd>
        </label>
        <ul className="palette-list" role="listbox">
          {results.map((r, i) => (
            <li key={r.to} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                className={`palette-item ${i === cursor ? 'is-active' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r)}
              >
                {r.metric ? (
                  <IconSquareRotatedFilled size={10} className="nav-diamond" />
                ) : (
                  <IconArrowRight size={14} stroke={1.5} />
                )}
                <span className="palette-label">{r.label}</span>
                <span className="palette-hint">{r.hint}</span>
              </button>
            </li>
          ))}
          {!results.length && <li className="palette-empty">Nothing matches “{query}”.</li>}
        </ul>
        <footer className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>
              <IconCornerDownLeft size={10} />
            </kbd>{' '}
            to open
          </span>
        </footer>
      </div>
    </div>
  )
}
