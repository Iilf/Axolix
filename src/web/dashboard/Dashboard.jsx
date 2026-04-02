import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Plus, Users, Clock, ShieldCheck, Settings, ChevronRight, RefreshCw } from 'lucide-react'
import { useAuth, supabase } from '../../shared.jsx'

// ── Server card ────────────────────────────────────────────────────────────
function ServerCard({ server, onClick }) {
  return (
    <button className="dashboard-server-card card" onClick={onClick}>
      <div className="dashboard-server-card__logo">
        {server.logo_url
          ? <img src={server.logo_url} alt={server.name} />
          : <span>{server.name.charAt(0).toUpperCase()}</span>
        }
      </div>
      <div className="dashboard-server-card__info">
        <p className="dashboard-server-card__name">{server.name}</p>
        <p className="dashboard-server-card__id">ID: {server.guild_id}</p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--text-3)', marginLeft: 'auto', flexShrink: 0 }} />
    </button>
  )
}

// ── No servers prompt ──────────────────────────────────────────────────────
function NoServers() {
  return (
    <div className="dashboard-empty">
      <LayoutDashboard size={32} strokeWidth={1.5} style={{ color: 'var(--text-3)' }} />
      <h3>No servers yet</h3>
      <p>Add the Axolix bot to your Discord server to get started.</p>
      <a
        className="btn btn-primary"
        href="https://discord.com/oauth2/authorize"
        target="_blank"
        rel="noreferrer"
      >
        <Plus size={15} />
        Add to Discord
      </a>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [servers, setServers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  async function loadServers() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('id, guild_id, name, logo_url, description')
        .order('name')

      if (error) throw error
      setServers(data ?? [])
    } catch (err) {
      setError('Failed to load servers.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadServers() }, [])

  return (
    <div className="dashboard-page">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header__left">
            {user?.discordAvatar && (
              <img
                className="dashboard-header__avatar"
                src={user.discordAvatar}
                alt={user.discordUsername}
              />
            )}
            <div>
              <p className="dashboard-header__greeting">Welcome back,</p>
              <h2 className="dashboard-header__name">{user?.discordUsername ?? '…'}</h2>
            </div>
          </div>
          <button className="btn-icon" onClick={loadServers} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Quick links */}
        <div className="dashboard-quicklinks">
          {[
            { icon: Users,       label: 'Staff',    path: 'staff'    },
            { icon: Clock,       label: 'Shifts',   path: 'shifts'   },
            { icon: ShieldCheck, label: 'Bans',     path: 'bans'     },
            { icon: Settings,    label: 'Settings', path: 'settings' },
          ].map(({ icon: Icon, label, path }) => (
            <div key={path} className="dashboard-quicklink">
              <Icon size={18} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Server list */}
        <div className="dashboard-section">
          <p className="section-label">Your Servers</p>

          {loading && (
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</p>
          )}

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>
          )}

          {!loading && !error && servers.length === 0 && <NoServers />}

          {!loading && !error && servers.length > 0 && (
            <div className="dashboard-server-list">
              {servers.map(server => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onClick={() => navigate(`/dashboard/${server.guild_id}/staff`)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}