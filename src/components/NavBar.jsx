import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Globe,
  Menu,
  X,
  LogIn,
  ChevronDown,
} from 'lucide-react'
import './NavBar.css'

const NAV_LINKS = [
  { to: '/directory',  label: 'Directory',  icon: Globe },
  { to: '/resources',  label: 'Resources',  icon: BookOpen, dropdown: true },
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
]

const RESOURCE_LINKS = [
  { to: '/resources/guides',    label: 'Guides' },
  { to: '/resources/commands',  label: 'Commands' },
  { to: '/resources/api',       label: 'API Docs' },
  { to: '/resources/changelog', label: 'Changelog' },
  { to: '/resources/links',     label: 'External Links' },
]

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <Zap size={20} strokeWidth={2.5} />
          <span>Axolix</span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__links" aria-label="Primary">
          {NAV_LINKS.map(({ to, label, icon: Icon, dropdown }) =>
            dropdown ? (
              <div
                key={to}
                className="navbar__dropdown-wrap"
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
              >
                <button className="navbar__link navbar__link--dropdown">
                  <Icon size={15} />
                  {label}
                  <ChevronDown size={13} className={resourcesOpen ? 'rotated' : ''} />
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
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <LogIn size={15} />
            Sign in
          </button>

          {/* Mobile burger */}
          <button
            className="navbar__burger"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
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