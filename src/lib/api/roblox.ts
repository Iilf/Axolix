/**
 * src/lib/api/roblox.ts
 *
 * Roblox API wrapper — server-side only.
 * All browser calls go through /api/roblox/user/[id] to avoid CORS.
 * Direct calls from this module are only made from Next.js server context.
 */

import type { RobloxUserResponse } from "@/types/api"

const ROBLOX_USERS_API    = "https://users.roblox.com/v1"
const ROBLOX_THUMBS_API   = "https://thumbnails.roblox.com/v1"

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function robloxFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 300 }, // Roblox profile data changes rarely — 5 min cache
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Roblox API error ${res.status} on ${url}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ─── User lookup ──────────────────────────────────────────────────────────────

/**
 * Fetches a Roblox user's profile by their user ID.
 * Used by the /api/roblox/user/[id] proxy route.
 */
export async function getRobloxUser(robloxId: string | number): Promise<RobloxUserResponse> {
  const [profile, avatar] = await Promise.allSettled([
    robloxFetch<{ id: number; name: string; displayName: string }>(
      `${ROBLOX_USERS_API}/users/${robloxId}`,
    ),
    getRobloxAvatarUrl(robloxId),
  ])

  const p = profile.status === "fulfilled" ? profile.value : null
  const a = avatar.status  === "fulfilled" ? avatar.value  : null

  if (!p) throw new Error(`Roblox user ${robloxId} not found`)

  return {
    id:          String(p.id),
    username:    p.name,
    displayName: p.displayName,
    avatarUrl:   a,
  }
}

/**
 * Batch lookup of multiple Roblox users by ID.
 * Uses the v1/users endpoint which accepts up to 100 IDs per request.
 */
export async function getRobloxUsers(
  robloxIds: (string | number)[],
): Promise<RobloxUserResponse[]> {
  if (robloxIds.length === 0) return []

  // Roblox batch API accepts max 100 IDs
  const chunks: (string | number)[][] = []
  for (let i = 0; i < robloxIds.length; i += 100) {
    chunks.push(robloxIds.slice(i, i + 100))
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      robloxFetch<{ data: Array<{ id: number; name: string; displayName: string }> }>(
        `${ROBLOX_USERS_API}/users`,
      ).then(() =>
        // POST endpoint — fetch wrapper above is GET-only, build manually
        fetch(`${ROBLOX_USERS_API}/users`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ userIds: chunk, excludeBannedUsers: false }),
        }).then((r) => r.json()),
      ),
    ),
  )

  return results.flatMap((r: { data: Array<{ id: number; name: string; displayName: string }> }) =>
    r.data.map((u) => ({
      id:          String(u.id),
      username:    u.name,
      displayName: u.displayName,
      avatarUrl:   null, // batch lookups don't include avatars — fetch separately if needed
    })),
  )
}

/**
 * Look up a Roblox user ID by username.
 * Used when banning by username rather than ID.
 */
export async function getRobloxUserIdByUsername(username: string): Promise<string | null> {
  try {
    const res = await fetch(`${ROBLOX_USERS_API}/usernames/users`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    })
    const json = await res.json()
    const user = json?.data?.[0]
    return user ? String(user.id) : null
  } catch {
    return null
  }
}

// ─── Thumbnails ───────────────────────────────────────────────────────────────

/**
 * Fetches the headshot avatar URL for a Roblox user.
 * Returns null if the thumbnail is not available.
 */
export async function getRobloxAvatarUrl(
  robloxId: string | number,
  size: "48x48" | "75x75" | "100x100" | "150x150" | "180x180" = "150x150",
): Promise<string | null> {
  try {
    const res = await robloxFetch<{
      data: Array<{ imageUrl: string; state: string }>
    }>(
      `${ROBLOX_THUMBS_API}/users/avatar-headshot?userIds=${robloxId}&size=${size}&format=Png&isCircular=false`,
    )
    const thumb = res.data?.[0]
    return thumb?.state === "Completed" ? thumb.imageUrl : null
  } catch {
    return null
  }
}

/**
 * Batch fetch avatar URLs for multiple Roblox users.
 */
export async function getRobloxAvatarUrls(
  robloxIds: (string | number)[],
  size: "48x48" | "75x75" | "100x100" = "100x100",
): Promise<Record<string, string | null>> {
  if (robloxIds.length === 0) return {}

  try {
    const ids = robloxIds.join(",")
    const res = await robloxFetch<{
      data: Array<{ targetId: number; imageUrl: string; state: string }>
    }>(
      `${ROBLOX_THUMBS_API}/users/avatar-headshot?userIds=${ids}&size=${size}&format=Png&isCircular=false`,
    )

    return Object.fromEntries(
      res.data.map((d) => [
        String(d.targetId),
        d.state === "Completed" ? d.imageUrl : null,
      ]),
    )
  } catch {
    return Object.fromEntries(robloxIds.map((id) => [String(id), null]))
  }
}
