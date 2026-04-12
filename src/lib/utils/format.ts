/**
 * src/lib/utils/format.ts
 *
 * All date, duration, number, and string formatters used across the app.
 * Pure functions — no React, no side effects.
 *
 * These are the canonical implementations. Components must not reimplement
 * formatting logic inline — import from here.
 */

// ─── Duration ─────────────────────────────────────────────────────────────────

/**
 * Format a duration in seconds to HH:MM:SS.
 * Used by ActiveShiftTimer and shift table cells.
 *
 * formatDuration(3661) → "01:01:01"
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

/**
 * Format a duration in seconds to a human-readable string.
 * Used in shift history rows where HH:MM:SS is too terse.
 *
 * formatDurationHuman(3661)  → "1h 1m"
 * formatDurationHuman(90)    → "1m 30s"
 * formatDurationHuman(45)    → "45s"
 */
export function formatDurationHuman(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/**
 * Calculate elapsed seconds between a start ISO timestamp and now (or an end).
 * Returns 0 if startedAt is invalid.
 */
export function elapsedSeconds(startedAt: string, endedAt?: string | null): number {
  const start = new Date(startedAt).getTime()
  const end   = endedAt ? new Date(endedAt).getTime() : Date.now()
  if (isNaN(start)) return 0
  return Math.max(0, Math.floor((end - start) / 1000))
}

// ─── Relative time ────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp as a relative time string.
 * Used in activity feeds, audit logs, notification lists.
 *
 * formatRelative("2024-01-01T12:00:00Z") → "2 hours ago"
 */
export function formatRelative(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  if (isNaN(date.getTime())) return "Unknown"

  const now     = Date.now()
  const diffMs  = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60)  return "just now"
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60)
    return `${m} minute${m === 1 ? "" : "s"} ago`
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600)
    return `${h} hour${h === 1 ? "" : "s"} ago`
  }
  if (diffSec < 604800) {
    const d = Math.floor(diffSec / 86400)
    return `${d} day${d === 1 ? "" : "s"} ago`
  }

  return formatDate(isoTimestamp)
}

// ─── Date / time ──────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp to a short date string.
 *
 * formatDate("2024-06-15T12:00:00Z") → "15 Jun 2024"
 */
export function formatDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  })
}

/**
 * Format an ISO timestamp to a date + time string.
 *
 * formatDateTime("2024-06-15T14:30:00Z") → "15 Jun 2024, 14:30"
 */
export function formatDateTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format an ISO timestamp to a time-only string.
 *
 * formatTime("2024-06-15T14:30:00Z") → "14:30"
 */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleTimeString("en-GB", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Format a ban expiry timestamp. Returns "Permanent" for null.
 *
 * formatExpiry(null)       → "Permanent"
 * formatExpiry("2025-...") → "15 Jun 2025"
 */
export function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Permanent"
  return formatDate(expiresAt)
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Format a large number with compact notation.
 * Used in stat cards, player counts, member counts.
 *
 * formatCompact(1234)    → "1.2K"
 * formatCompact(1234567) → "1.2M"
 * formatCompact(999)     → "999"
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

/**
 * Format a number with locale-aware thousand separators.
 *
 * formatNumber(12345) → "12,345"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-GB")
}

/**
 * Format a player count as "current / capacity".
 *
 * formatPlayerCount(32, 50) → "32 / 50"
 */
export function formatPlayerCount(current: number, max: number): string {
  return `${current} / ${max}`
}

// ─── Strings ──────────────────────────────────────────────────────────────────

/**
 * Truncate a string to a max length, appending ellipsis if truncated.
 *
 * truncate("Hello world", 8) → "Hello wo…"
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "…"
}

/**
 * Capitalise the first letter of a string.
 *
 * capitalise("hello") → "Hello"
 */
export function capitalise(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert a snake_case or kebab-case string to Title Case.
 * Used for displaying enum values as labels.
 *
 * toTitleCase("traffic_stop") → "Traffic Stop"
 * toTitleCase("on-scene")     → "On Scene"
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format a Discord avatar URL from a user ID and avatar hash.
 * Falls back to the default Discord avatar if no hash is provided.
 */
export function formatDiscordAvatar(userId: string, avatarHash: string | null): string {
  if (!avatarHash) {
    const index = (BigInt(userId) >> 22n) % 6n
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=128`
}

/**
 * Format a Discord guild icon URL from a guild ID and icon hash.
 */
export function formatGuildIcon(guildId: string, iconHash: string | null): string | null {
  if (!iconHash) return null
  const ext = iconHash.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=128`
}

/**
 * Format a Roblox thumbnail URL from a user ID.
 * Size is the square pixel dimension (headshot endpoint).
 */
export function formatRobloxAvatar(userId: string | number, size: 48 | 75 | 100 | 150 | 180 = 100): string {
  return `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=${size}x${size}&format=Png&isCircular=false`
}
