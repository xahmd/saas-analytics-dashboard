import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconMenu2, IconSearch } from '@tabler/icons-react'
import { useApp } from '../state'

type Props = {
  title?: ReactNode
  back?: string | true
  actions?: ReactNode
  children?: ReactNode
}

export function PageHeader({ title, back, actions, children }: Props) {
  const navigate = useNavigate()
  const { setNavOpen, setPaletteOpen } = useApp()
  return (
    <header className="page-header">
      <button type="button" className="icon-btn menu-btn" onClick={() => setNavOpen(true)} aria-label="Open navigation">
        <IconMenu2 size={18} stroke={1.5} />
      </button>
      {back && (
        <button
          type="button"
          className="icon-btn"
          onClick={() => (back === true ? navigate(-1) : navigate(back))}
          aria-label="Back"
        >
          <IconChevronLeft size={16} stroke={1.5} />
        </button>
      )}
      {title && <h1 className="page-title">{title}</h1>}
      {children}
      <div className="page-header-actions">
        {actions}
        <button type="button" className="search-hint" onClick={() => setPaletteOpen(true)} aria-label="Search">
          <IconSearch size={14} stroke={1.5} />
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
    </header>
  )
}
