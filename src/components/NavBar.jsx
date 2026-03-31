import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Zap, LayoutDashboard, BookOpen, Globe,
  Menu, X, LogIn, ChevronDown, Palette, Check,
} from 'lucide-react'

// ── Theme definitions ──────────────────────────────────────────────────────
export const THEMES = [
  { id: 'dark',     label: 'Dark',     swatch: '#111118' },
  { id: 'light',    label: 'Light',    swatch: '#f4f3fc' },
  { id: 'midnight', label: 'Midnight', swatch: '#0d1320' },
  { id: 'dusk',     label: 'Dusk',     swatch: '#1a1917' },
  { id: 'arctic',   label: 'Arctic',   swatch: '#eef3f8' },
]

// ── Hook: persist theme in localStorage, apply to <html> ──────────────────
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('axolix-theme') ?? 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('axolix-theme', theme)
  }, [theme])
  return [theme, setTheme]
}

// ── Nav links ──────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/directory', label: 'Directory', icon: Globe },
  { to: '/resources', label: 'Resources', icon: BookOpen, dropdown: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const RESOURCE_LINKS = [
  { to: '/resources/guides',    label: 'Guides' },
  { to: '/resources/commands',  label: 'Commands' },
  { to: '/resources/api',       label: 'API Docs' },
  { to: '/resources/changelog', label: 'Changelog' },
  { to: '/resources/links',     label: 'External Links' },
]

// ── ThemePicker ───────────────────────────────────────────────────────────
function ThemePicker({ theme, setTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="theme-picker" ref={ref}>
      <button
        className="btn-icon"
        aria-label="Change theme"
        onClick={() => setOpen(v => !v)}
      >
        <Palette size={16} />
      </button>

      {open && (
        <div className="theme-picker__panel">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={"theme-picker__option" + (theme === t.id ? ' theme-picker__option--active' : '')}
              onClick={() => { setTheme(t.id); setOpen(false) }}
            >
              <span
                className="theme-picker__swatch"
                style={{ background: t.swatch }}
              />
              {t.label}
              {theme === t.id && <Check size={13} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── NavBar ─────────────────────────────────────────────────────────────────
export default function NavBar({ theme, setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <Zap size={20} strokeWidth={2.5} />
          <span>Axolix</span>
        </Link>

        <nav className="navbar__links row" style={{ gap: 4, flex: 1 }} aria-label="Primary">
          {NAV_LINKS.map(({ to, label, icon: Icon, dropdown }) =>
            dropdown ? (
              <div
                key={to}
                className="navbar__dropdown-wrap"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button className="navbar__link">
                  <Icon size={15} />
                  {label}
                  <ChevronDown
                    size={13}
                    style={{
                      transition: 'transform 200ms',
                      transform: resourcesOpen ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </button>
                {resourcesOpen && (
                  <div className="navbar__dropdown">
                    {RESOURCE_LINKS.map(r => (
                      <Link
                        key={r.to}
                        to={r.to}
                        className="navbar__dropdown-item"
                        onClick={() => setResourcesOpen(false)}
                      >
                        {r.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "navbar__link" + (isActive ? ' navbar__link--active' : '')
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        <span className="navbar__sep" />

        <div className="navbar__actions">
          <ThemePicker theme={theme} setTheme={setTheme} />
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <LogIn size={15} />
            Sign in
          </button>
          <button
            className="navbar__burger"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="navbar__mobile" aria-label="Mobile">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="navbar__mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <div className="navbar__mobile-divider" />
          <button
            className="btn btn-primary"
            style={{ margin: '0 16px' }}
            onClick={() => { navigate('/login'); setMobileOpen(false) }}
          >
            <LogIn size={15} />
            Sign in with Discord
          </button>
        </nav>
      )}
    </header>
  )
}