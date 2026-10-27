import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import { PEOPLE } from '../data/workspace'
import { useApp } from '../state'

type Variant = 'outline' | 'light' | 'ghost' | 'ink' | 'paper'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function Button({ variant = 'outline', size = 'md', icon, className = '', children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`btn btn-${variant} btn-${size} ${className}`} {...rest}>
      {icon}
      {children && <span>{children}</span>}
    </button>
  )
}

export function Chip({ children, onRemove, tone = 'blue' }: { children: ReactNode; onRemove?: () => void; tone?: 'blue' | 'rose' | 'neutral' }) {
  return (
    <span className={`chip chip-${tone}`}>
      {children}
      {onRemove && (
        <button type="button" className="chip-x" onClick={onRemove} aria-label={`Remove ${children}`}>
          <IconX size={12} stroke={1.5} />
        </button>
      )}
    </span>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  size?: 'md' | 'lg'
}) {
  return (
    <div className={`segmented segmented-${size}`} role="tablist">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={o === value}
          className={`segmented-item ${o === value ? 'is-active' : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function PaperBanner({
  title,
  body,
  art,
  actions,
  compact,
}: {
  title: string
  body: ReactNode
  art: string
  actions?: ReactNode
  compact?: boolean
}) {
  return (
    <section className={`paper ${compact ? 'paper-compact' : ''}`}>
      <div className="paper-copy">
        <h2 className="paper-title">{title}</h2>
        <p className="paper-body">{body}</p>
        {actions && <div className="paper-actions">{actions}</div>}
      </div>
      <img className="paper-art" src={art} alt="" />
    </section>
  )
}

export function Avatar({ id, size = 22 }: { id: string; size?: number }) {
  const person = PEOPLE[id]
  return (
    <span
      className="avatar"
      title={person?.name ?? id}
      style={{ width: size, height: size, background: person?.color ?? 'var(--surface-raised)', fontSize: size * 0.4 }}
    >
      {id}
    </span>
  )
}

export function AvatarStack({ ids, max = 4 }: { ids: string[]; max?: number }) {
  const rest = ids.length - max
  return (
    <span className="avatar-stack">
      {ids.slice(0, max).map((id) => (
        <Avatar key={id} id={id} />
      ))}
      {rest > 0 && <span className="avatar avatar-more">+{rest}</span>}
    </span>
  )
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('input, textarea, button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div ref={ref} className="modal" role="dialog" aria-modal aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={16} stroke={1.5} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-dot" />
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function Menu({
  trigger,
  items,
  align = 'end',
}: {
  trigger: (props: { onClick: () => void; 'aria-expanded': boolean }) => ReactNode
  items: Array<{ label: string; onSelect: () => void; active?: boolean; disabled?: boolean }>
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="menu" ref={ref}>
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open })}
      {open && (
        <div className={`menu-pop menu-${align}`} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`menu-item ${item.active ? 'is-active' : ''}`}
              onClick={() => {
                item.onSelect()
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="section-title">
      <h3>{children}</h3>
      {aside}
    </div>
  )
}
