import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON
export const ORACLE_BASE_URL = import.meta.env.VITE_ORACLE_BASE_URL ?? 'http://localhost:3001'

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON — check Cloudflare Pages environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

export async function oracleFetch(path, options = {}) {
  const res = await fetch(`${ORACLE_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json()
}

export const ROBLOX_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export function isRobloxCacheStale(updatedAt) {
  if (!updatedAt) return true
  return Date.now() - new Date(updatedAt).getTime() > ROBLOX_CACHE_TTL_MS
}

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