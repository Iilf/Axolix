/**
 * src/lib/auth/providers.ts
 *
 * Discord and Roblox OAuth URL builders with CSRF state generation.
 * Called by the redirect route handlers before sending the browser
 * to the external OAuth provider.
 *
 * State parameter prevents CSRF — generated here, validated on callback.
 */

import { cookies } from "next/headers"
import type { OAuthState } from "@/types/auth"
import {
  DISCORD_OAUTH_URL,
  DISCORD_TOKEN_URL,
  DISCORD_API_BASE,
  DISCORD_SCOPES,
  ROBLOX_OAUTH_URL,
  ROBLOX_TOKEN_URL,
  ROBLOX_USERINFO_URL,
  ROBLOX_SCOPES,
  COOKIE_OAUTH,
  COOKIE_OAUTH_MAX_AGE,
} from "@/lib/utils/constants"
import type { DiscordTokenResponse, DiscordProfile, RobloxTokenResponse, RobloxProfile } from "@/types/auth"

// ─── CSRF state ───────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random CSRF token for the OAuth state param.
 */
function generateCsrfToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Writes the OAuth state to the axolix_oauth cookie and returns
 * the encoded state string to include in the OAuth redirect URL.
 */
export async function createOAuthState(
  provider: OAuthState["provider"],
  redirectTo: string = "/dashboard",
): Promise<string> {
  const state: OAuthState = {
    csrfToken:  generateCsrfToken(),
    redirectTo,
    provider,
    createdAt:  new Date().toISOString(),
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_OAUTH, JSON.stringify(state), {
    httpOnly:  true,
    secure:    true,
    sameSite:  "lax",
    maxAge:    COOKIE_OAUTH_MAX_AGE,
    path:      "/",
  })

  // The state param in the OAuth URL is just the CSRF token.
  // The full state (including redirectTo) is kept server-side in the cookie.
  return state.csrfToken
}

/**
 * Reads and validates the OAuth state cookie on callback.
 * Returns null if the state is missing, expired, or the CSRF token doesn't match.
 */
export async function validateOAuthState(
  provider: OAuthState["provider"],
  receivedCsrfToken: string,
): Promise<OAuthState | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_OAUTH)?.value
  if (!raw) return null

  let state: OAuthState
  try {
    state = JSON.parse(raw)
  } catch {
    return null
  }

  // Clear the state cookie — one-time use
  cookieStore.set(COOKIE_OAUTH, "", { maxAge: 0, path: "/" })

  if (state.provider !== provider)              return null
  if (state.csrfToken !== receivedCsrfToken)    return null

  // Reject states older than 10 minutes
  const age = Date.now() - new Date(state.createdAt).getTime()
  if (age > COOKIE_OAUTH_MAX_AGE * 1000)        return null

  return state
}

// ─── Discord ──────────────────────────────────────────────────────────────────

/**
 * Builds the Discord OAuth authorisation URL.
 * Redirects the user's browser to this URL to begin login.
 */
export async function buildDiscordAuthUrl(redirectTo?: string): Promise<string> {
  const csrfToken = await createOAuthState("discord", redirectTo)
  const params    = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
    response_type: "code",
    scope:         DISCORD_SCOPES.join(" "),
    state:         csrfToken,
  })
  return `${DISCORD_OAUTH_URL}?${params}`
}

/**
 * Exchanges a Discord authorisation code for an access token.
 */
export async function exchangeDiscordCode(code: string): Promise<DiscordTokenResponse> {
  const res = await fetch(DISCORD_TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type:    "authorization_code",
      code,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Discord token exchange failed: ${res.status} ${body}`)
  }

  return res.json() as Promise<DiscordTokenResponse>
}

/**
 * Fetches the authenticated Discord user's profile.
 */
export async function fetchDiscordProfile(accessToken: string): Promise<DiscordProfile> {
  const res = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Discord profile fetch failed: ${res.status}`)
  }

  return res.json() as Promise<DiscordProfile>
}

// ─── Roblox ───────────────────────────────────────────────────────────────────

/**
 * Builds the Roblox OAuth authorisation URL.
 * Called when an authenticated user initiates Roblox account linking.
 */
export async function buildRobloxAuthUrl(redirectTo?: string): Promise<string> {
  const csrfToken = await createOAuthState("roblox", redirectTo)
  const params    = new URLSearchParams({
    client_id:     process.env.ROBLOX_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/roblox/callback`,
    response_type: "code",
    scope:         ROBLOX_SCOPES.join(" "),
    state:         csrfToken,
  })
  return `${ROBLOX_OAUTH_URL}?${params}`
}

/**
 * Exchanges a Roblox authorisation code for an access token.
 */
export async function exchangeRobloxCode(code: string): Promise<RobloxTokenResponse> {
  const credentials = Buffer.from(
    `${process.env.ROBLOX_CLIENT_ID}:${process.env.ROBLOX_CLIENT_SECRET}`,
  ).toString("base64")

  const res = await fetch(ROBLOX_TOKEN_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/roblox/callback`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Roblox token exchange failed: ${res.status} ${body}`)
  }

  return res.json() as Promise<RobloxTokenResponse>
}

/**
 * Fetches the authenticated Roblox user's profile.
 */
export async function fetchRobloxProfile(accessToken: string): Promise<RobloxProfile> {
  const res = await fetch(ROBLOX_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Roblox profile fetch failed: ${res.status}`)
  }

  return res.json() as Promise<RobloxProfile>
}
