import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Plus, Settings, ChevronRight, RefreshCw, Shield, Star } from 'lucide-react'
import { useAuth, supabase } from '../../shared.jsx'
import AddServerModal from './AddServerModal.jsx'

// ── Server card ────────────────────────────────────────────────────────────
function ServerCard({ server, role, onClick }) {
  return (
    <button className="server-card" onClick={onClick}>
      <div className="server-card__banner">
        {server.banner_url
          ? <img src={server.banner_url} alt="" className="server-card__banner-img" />
          : <div className="server-card__banner-fallback" />
        }
      </div>
      <div className="server-card__logo">
        {server.logo_url
          ? <img src={server.logo_url} alt={server.name} />
          : <span>{server.name.charAt(0).toUpperCase()}</span>
        }
      </div>
      <div className="server-card__body">
        <div className="server-card__top">
          <p className="server-card__name">{server.name}</p>
          <ChevronRight size={14} className="server-card__arrow" />
        </div>
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
function NoServers({ onAdd }) {
  return (
    <div className="dashboard-empty">
      <LayoutDashboard size={32} strokeWidth={1.5} />
      <h3>No servers yet</h3>
      <p>Add a Discord server to start managing it with Axolix.</p>
      <button className="btn btn-primary" onClick={onAdd}>
        <Plus size={15} />
        Add a Server
      </button>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [showAdd,  setShowAdd]  = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select(`
          server:servers ( id, guild_id, name, logo_url, banner_url, description ),
          role:staff_roles ( rank_name, rank_level, color )
        `)
        .is('removed_at', null)
        .order('joined_at', { ascending: false })

      if (error) throw error

      // Also fetch servers the user owns but may not be a staff member of yet
      const { data: owned } = await supabase
        .from('servers')
        .select('id, guild_id, name, logo_url, banner_url, description')
        .order('name')

      // Merge: owned servers not already in staff_members entries
      const staffServerIds = new Set((data ?? []).map(e => e.server?.id).filter(Boolean))
      const ownedExtra = (owned ?? [])
        .filter(s => !staffServerIds.has(s.id))
        .map(s => ({ server: s, role: null }))

      const all = [
        ...(data ?? []).filter(e => e.server),
        ...ownedExtra,
      ].sort((a, b) => a.server.name.localeCompare(b.server.name))

      setEntries(all)
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

        {/* Header */}
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
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => setShowAdd(true)}>
              <Plus size={14} />
              Add Server
            </button>
            <button className="btn-icon" onClick={() => navigate('/dashboard/settings')} title="Settings">
              <Settings size={16} />
            </button>
            <button className="btn-icon" onClick={load} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
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

        {/* Server grid */}
        <div className="dashboard-section">
          <p className="section-label">Your Servers</p>

          {loading && <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Loading…</p>}
          {error   && <p style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</p>}

          {!loading && !error && entries.length === 0 && (
            <NoServers onAdd={() => setShowAdd(true)} />
          )}

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

      {/* Add server modal */}
      {showAdd && (
        <AddServerModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load() }}
        />
      )}
    </div>
  )
}