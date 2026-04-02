import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Plus, Settings, ChevronRight, RefreshCw, Shield, Star } from 'lucide-react'
import { useAuth, supabase } from '../../shared.jsx'

// ── Server card ────────────────────────────────────────────────────────────
function ServerCard({ server, role, onClick }) {
  return (
    <button className="server-card" onClick={onClick}>

      {/* Banner */}
      <div className="server-card__banner">
        {server.banner_url
          ? <img src={server.banner_url} alt="" className="server-card__banner-img" />
          : <div className="server-card__banner-fallback" />
        }
      </div>

      {/* Logo */}
      <div className="server-card__logo">
        {server.logo_url
          ? <img src={server.logo_url} alt={server.name} />
          : <span>{server.name.charAt(0).toUpperCase()}</span>
        }
      </div>

      {/* Info */}
      <div className="server-card__body">
        <div className="server-card__top">
          <p className="server-card__name">{server.name}</p>
          <ChevronRight size={14} className="server-card__arrow" />
        </div>

        {/* Role badge */}
        {role && (
          <div className="server-card__role" style={{ '--role-color': role.color ?? 'var(--primary)' }}>
            {role.rank_name}
          </div>
        )}

        {server.description && (
          <p className="server-card__desc">{server.description}</p>
        )}
      </div>

    </button>
  )
}

// ── No servers ─────────────────────────────────────────────────────────────
function NoServers() {
  return (
    <div className="dashboard-empty">
      <LayoutDashboard size={32} strokeWidth={1.5} />
      <h3>No servers yet</h3>
      <p>You are not a staff member on any server using Axolix.</p>
      <a
        className="btn btn-primary"
        href="https://discord.com/oauth2/authorize"
        target="_blank"
        rel="noreferrer"
      >
        <Plus size={15} />
        Add Axolix to Discord
      </a>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [entries, setEntries] = useState([])   // [{ server, role }]
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      // Fetch servers the current user is an active staff member of,
      // joined with their role on each server
      const { data, error } = await supabase
        .from('staff_members')
        .select(`
          server:servers ( id, guild_id, name, logo_url, banner_url, description ),
          role:staff_roles ( rank_name, rank_level, color )
        `)
        .is('removed_at', null)
        .order('joined_at', { ascending: false })

      if (error) throw error

      setEntries(
        (data ?? [])
          .filter(e => e.server)
          .sort((a, b) => a.server.name.localeCompare(b.server.name))
      )
    } catch (err) {
      setError('Failed to load servers.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div className="dashboard-header__left">
            {user?.discordAvatar
              ? <img className="dashboard-header__avatar" src={user.discordAvatar} alt={user.discordUsername} />
              : <div className="dashboard-header__avatar dashboard-header__avatar--fallback">
                  {user?.discordUsername?.charAt(0).toUpperCase()}
                </div>
            }
            <div>
              <p className="dashboard-header__greeting">Welcome back,</p>
              <h2 className="dashboard-header__name">{user?.discordUsername ?? '…'}</h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon" onClick={() => navigate('/dashboard/settings')} title="Settings">
              <Settings size={16} />
            </button>
            <button className="btn-icon" onClick={load} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <Shield size={16} />
            <span>{entries.length} server{entries.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="dashboard-stat">
            <Star size={16} />
            <span>
              {entries.filter(e => e.role?.rank_level >= 5).length} senior role{entries.filter(e => e.role?.rank_level >= 5).length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Server directory ── */}
        <div className="dashboard-section">
          <p className="section-label">Your Servers</p>

          {loading && <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</p>}
          {error   && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

          {!loading && !error && entries.length === 0 && <NoServers />}

          {!loading && !error && entries.length > 0 && (
            <div className="server-card-grid">
              {entries.map(({ server, role }) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  role={role}
                  onClick={() => navigate(`/dashboard/${server.guild_id}/settings`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}