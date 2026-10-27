import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBrandAppleFilled, IconLoader2 } from '@tabler/icons-react'

function Google() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.8 3.3-8.1z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
    </svg>
  )
}

function Microsoft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  )
}

const PROVIDERS: Array<{ id: string; label: string; icon: ReactNode }> = [
  { id: 'google', label: 'Continue with Google', icon: <Google /> },
  { id: 'apple', label: 'Continue with Apple', icon: <IconBrandAppleFilled size={16} /> },
  { id: 'microsoft', label: 'Continue with Microsoft', icon: <Microsoft /> },
]

export function SignIn() {
  const navigate = useNavigate()
  const [pending, setPending] = useState<string | null>(null)

  const go = (id: string) => {
    setPending(id)
    window.setTimeout(() => navigate('/'), 900)
  }

  return (
    <div className="signin">
      <div className="signin-inner rise">
        <img src="/illustrations/door.png" alt="" className="signin-art" />
        <h1 className="display signin-title">
          Sign in or create
          <br />a new account
        </h1>
        <div className="providers">
          {PROVIDERS.map((p) => (
            <button key={p.id} type="button" className="provider" onClick={() => go(p.id)} disabled={pending !== null}>
              {pending === p.id ? <IconLoader2 size={16} className="spin" /> : p.icon}
              {p.label}
            </button>
          ))}
        </div>
        <p className="legal">
          By continuing, you agree to our <a href="#terms">Terms of Service</a>, <a href="#privacy">Privacy Policy</a> and{' '}
          <a href="#dpa">Data Protection Agreement</a>
        </p>
      </div>
    </div>
  )
}
