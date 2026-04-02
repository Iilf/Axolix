import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// ── Supabase client ────────────────────────────────────────────────────────
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON
)

export const ORACLE_BASE_URL = import.meta.env.VITE_ORACLE_BASE_URL ?? 'http://localhost:3001'

// ── useAuth ────────────────────────────────────────────────────────────────
// Returns { user, session, loading }
// user.discordUsername, user.discordAvatar are pulled straight from
// Supabase OAuth metadata — no extra fetch needed.
export function useAuth() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [user, setUser]       = useState(null)

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
      setUser(session ? buildUser(session) : null)
    })

    // Listen for login / logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      setUser(session ? buildUser(session) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    session,
    user,
    loading: session === undefined,
    signOut: () => supabase.auth.signOut(),
  }
}

function buildUser(session) {
  const meta = session.user.user_metadata ?? {}
  return {
    id:              session.user.id,
    discordId:       meta.provider_id ?? meta.sub ?? null,
    discordUsername: meta.full_name ?? meta.user_name ?? 'Unknown',
    discordAvatar:   meta.avatar_url ?? null,
    email:           session.user.email ?? null,
  }
}

// ── Oracle fetch helper ────────────────────────────────────────────────────
export async function oracleFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${ORACLE_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

// ── Roblox cache ───────────────────────────────────────────────────────────
export const ROBLOX_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export function isRobloxCacheStale(updatedAt) {
  if (!updatedAt) return true
  return Date.now() - new Date(updatedAt).getTime() > ROBLOX_CACHE_TTL_MS
}

// ── Misc helpers ───────────────────────────────────────────────────────────
export function formatDuration(seconds) {
  if (!seconds) return '0m'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}