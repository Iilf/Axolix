/**
 * src/lib/api/discord.ts
 *
 * Discord API wrapper — server-side only.
 * All calls go through Next.js API routes to keep tokens off the client.
 *
 * Uses Discord API v10.
 */

import { DISCORD_API_BASE, DISCORD_CDN_BASE } from "@/lib/utils/constants"
import type { DiscordGuild, DiscordProfile } from "@/types/auth"

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function discordFetch<T>(
  path: string,
  token: string,
  tokenType: "Bearer" | "Bot" = "Bearer",
): Promise<T> {
  const res = await fetch(`${DISCORD_API_BASE}${path}`, {
    headers: {
      Authorization: `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 }, // always fresh — Discord data changes often
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Discord API error ${res.status} on ${path}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ─── User ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the Discord user profile for the given OAuth access token.
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordProfile> {
  return discordFetch<DiscordProfile>("/users/@me", accessToken)
}

/**
 * Fetches the list of guilds (servers) the user is a member of.
 * Requires the `guilds` OAuth scope.
 */
export async function getDiscordUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  return discordFetch<DiscordGuild[]>("/users/@me/guilds", accessToken)
}

// ─── Guild ────────────────────────────────────────────────────────────────────

/**
 * Fetches guild details using the bot token.
 * Used to verify guild membership and get current owner ID.
 */
export async function getDiscordGuild(guildId: string): Promise<DiscordGuild & { owner_id: string }> {
  return discordFetch<DiscordGuild & { owner_id: string }>(
    `/guilds/${guildId}`,
    process.env.DISCORD_BOT_TOKEN!,
    "Bot",
  )
}

/**
 * Fetches the approximate member count for a guild.
 * Uses ?with_counts=true on the guild endpoint.
 */
export async function getGuildMemberCount(guildId: string): Promise<number> {
  const guild = await discordFetch<{ approximate_member_count?: number }>(
    `/guilds/${guildId}?with_counts=true`,
    process.env.DISCORD_BOT_TOKEN!,
    "Bot",
  )
  return guild.approximate_member_count ?? 0
}

/**
 * Fetches a specific member from a guild using the bot token.
 * Used for Discord role sync — checks current role assignments.
 */
export async function getGuildMember(
  guildId:  string,
  userId:   string,
): Promise<{ roles: string[]; nick: string | null }> {
  return discordFetch<{ roles: string[]; nick: string | null }>(
    `/guilds/${guildId}/members/${userId}`,
    process.env.DISCORD_BOT_TOKEN!,
    "Bot",
  )
}

// ─── CDN helpers ──────────────────────────────────────────────────────────────

/**
 * Builds a Discord user avatar URL.
 * Returns the default avatar URL if the user has no custom avatar.
 */
export function buildAvatarUrl(
  userId:     string,
  avatarHash: string | null,
  size: 32 | 64 | 128 | 256 | 512 = 128,
): string {
  if (!avatarHash) {
    const index = (BigInt(userId) >> 22n) % 6n
    return `${DISCORD_CDN_BASE}/embed/avatars/${index}.png`
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png"
  return `${DISCORD_CDN_BASE}/avatars/${userId}/${avatarHash}.${ext}?size=${size}`
}

/**
 * Builds a Discord guild icon URL.
 * Returns null if the guild has no icon.
 */
export function buildGuildIconUrl(
  guildId:  string,
  iconHash: string | null,
  size: 32 | 64 | 128 | 256 | 512 = 128,
): string | null {
  if (!iconHash) return null
  const ext = iconHash.startsWith("a_") ? "gif" : "png"
  return `${DISCORD_CDN_BASE}/icons/${guildId}/${iconHash}.${ext}?size=${size}`
}
