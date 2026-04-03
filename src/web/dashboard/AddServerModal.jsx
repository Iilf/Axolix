import { useState, useEffect } from 'react'
import { X, Plus, Bot, Check, AlertCircle, Search, ExternalLink } from 'lucide-react'
import { supabase } from '../../shared.jsx'

const DISCORD_API     = 'https://discord.com/api/v10'
const MANAGE_GUILD    = 0x20   // Discord permission bit for Manage Server
const BOT_INVITE_URL  = (guildId) =>
  `https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`

// ── Helpers ────────────────────────────────────────────────────────────────
function canManage(guild) {
  return guild.owner || (BigInt(guild.permissions ?? 0) & BigInt(MANAGE_GUILD)) !== 0n
}

function GuildIcon({ guild }) {
  if (guild.icon) {
    return (
      <img
        className="add-server-modal__guild-icon"
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`}
        alt={guild.name}
      />
    )
  }
  return (
    <div className="add-server-modal__guild-icon add-server-modal__guild-icon--fallback">
      {guild.name.charAt(0).toUpperCase()}
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────
export default function AddServerModal({ onClose, onAdded }) {
  const [guilds,      setGuilds]      = useState([])   // Discord guilds user manages
  const [axolixIds,   setAxolixIds]   = useState(new Set()) // guild_ids already in Axolix
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [adding,      setAdding]      = useState(null)  // guild_id currently being added
  const [addedNow,    setAddedNow]    = useState(new Set())
  const [query,       setQuery]       = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      // Get Discord access token from Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.provider_token
      if (!token) throw new Error('No Discord token — please sign out and sign back in.')

      // Fetch user's Discord guilds + existing Axolix servers in parallel
      const [discordRes, { data: existing }] = await Promise.all([
        fetch(`${DISCORD_API}/users/@me/guilds`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        supabase.from('servers').select('guild_id'),
      ])

      if (!discordRes.ok) throw new Error('Failed to fetch Discord guilds.')

      const allGuilds = await discordRes.json()

      // Only show guilds where the user has Manage Server permission
      setGuilds(allGuilds.filter(canManage))
      setAxolixIds(new Set((existing ?? []).map(s => s.guild_id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function addServer(guild) {
    setAdding(guild.id)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const { error } = await supabase.from('servers').insert({
        guild_id:    guild.id,
        name:        guild.name,
        logo_url:    guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=256`
          : null,
        banner_url:  guild.banner
          ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=600`
          : null,
        owner_id:    session.user.id,
        is_public:   false,
      })

      if (error) throw error

      setAddedNow(prev => new Set([...prev, guild.id]))
      onAdded?.()
    } catch (err) {
      setError(`Failed to add ${guild.name}: ${err.message}`)
    } finally {
      setAdding(null)
    }
  }

  const filtered = guilds.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-box__header">
          <h3>Add a Server</h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Search */}
        <div className="add-server-modal__search">
          <Search size={14} className="add-server-modal__search-icon" />
          <input
            className="add-server-modal__search-input"
            placeholder="Search your servers…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Body */}
        <div className="modal-box__body">
          {loading && (
            <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Loading your Discord servers…
            </p>
          )}

          {error && (
            <div className="add-server-modal__error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              No servers found.
            </p>
          )}

          {!loading && !error && filtered.map(guild => {
            const inAxolix  = axolixIds.has(guild.id) || addedNow.has(guild.id)
            const isAdding  = adding === guild.id

            return (
              <div key={guild.id} className="add-server-modal__guild-row">
                <GuildIcon guild={guild} />

                <div className="add-server-modal__guild-info">
                  <p className="add-server-modal__guild-name">{guild.name}</p>
                  {guild.owner && (
                    <span className="add-server-modal__guild-owner">Owner</span>
                  )}
                </div>

                <div className="add-server-modal__guild-actions">
                  {inAxolix ? (
                    <span className="add-server-modal__badge add-server-modal__badge--added">
                      <Check size={12} /> Added
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: 13 }}
                      onClick={() => addServer(guild)}
                      disabled={isAdding}
                    >
                      <Plus size={13} />
                      {isAdding ? 'Adding…' : 'Add'}
                    </button>
                  )}

                  {/* Bot invite — always show so they can add the bot */}
                  <a
                    className="btn btn-ghost add-server-modal__bot-btn"
                    href={BOT_INVITE_URL(guild.id)}
                    target="_blank"
                    rel="noreferrer"
                    title="Add bot to this server"
                    style={{ padding: '6px 10px', fontSize: 13 }}
                  >
                    <Bot size={13} />
                    Bot
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}