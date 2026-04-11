/**
 * src/types/auth.ts
 *
 * Types for the authentication layer — session JWT payload, OAuth profiles,
 * cookie names, and auth state shapes used across the app.
 */

import type { UserPlan, PermissionFlag } from "@/types/database"

// ─── Session JWT payload ──────────────────────────────────────────────────────
// Stored in the axolix_session httpOnly cookie.
// Never put sensitive data (service keys, secrets) in here — it is signed but
// not encrypted, so the payload is readable by the client if they decode it.

export interface SessionPayload {
  /** Supabase auth.uid() */
  userId:          string
  discordId:       string
  discordUsername: string
  avatarUrl:       string | null
  robloxId:        string | null
  robloxUsername:  string | null
  plan:            UserPlan
  isSuperadmin:    boolean
  /** ISO timestamp */
  issuedAt:        string
  /** ISO timestamp */
  expiresAt:       string
}

// ─── Session user ─────────────────────────────────────────────────────────────
// Derived from the JWT payload — what the rest of the app sees after the
// session cookie is validated. Permissions are resolved per server, not stored
// globally — use usePermissions() with an active server context.

export interface SessionUser {
  id:              string
  discordId:       string
  discordUsername: string
  avatarUrl:       string | null
  robloxId:        string | null
  robloxUsername:  string | null
  plan:            UserPlan
  isSuperadmin:    boolean
  isRobloxLinked:  boolean // derived: robloxId !== null
}

// ─── Discord OAuth ────────────────────────────────────────────────────────────

/** Raw profile returned by Discord's /users/@me endpoint */
export interface DiscordProfile {
  id:            string
  username:      string
  discriminator: string  // "0" for new-style usernames
  global_name:   string | null
  avatar:        string | null
  email:         string | null
  verified:      boolean
}

/** Raw token response from Discord's OAuth token endpoint */
export interface DiscordTokenResponse {
  access_token:  string
  token_type:    string
  expires_in:    number
  refresh_token: string
  scope:         string
}

/** A Discord guild as returned by the /users/@me/guilds endpoint */
export interface DiscordGuild {
  id:          string
  name:        string
  icon:        string | null
  owner:       boolean
  permissions: string
}

// ─── Roblox OAuth ─────────────────────────────────────────────────────────────

/** Raw profile returned by Roblox's userinfo endpoint */
export interface RobloxProfile {
  sub:              string  // Roblox user ID
  name:             string  // display name
  nickname:         string  // username
  profile:          string  // profile URL
  picture:          string | null
  preferred_username: string
}

/** Raw token response from Roblox's OAuth token endpoint */
export interface RobloxTokenResponse {
  access_token:  string
  token_type:    string
  expires_in:    number
  refresh_token: string
  scope:         string
  id_token:      string
}

// ─── Auth state shapes ────────────────────────────────────────────────────────

/** Result returned by auth guard helpers */
export type AuthResult =
  | { authenticated: true;  user: SessionUser }
  | { authenticated: false; redirectTo: string }

/** Shape of the resolved permissions for a user within a server */
export interface ServerPermissions {
  serverId:    string
  roleId:      string | null
  roleName:    string | null
  permissions: PermissionFlag[]
  isOwner:     boolean
  /** Convenience check — use can("manage_bans") pattern */
  can: (flag: PermissionFlag) => boolean
}

// ─── OAuth state cookie ───────────────────────────────────────────────────────
// Written before redirect, validated on callback to prevent CSRF.

export interface OAuthState {
  csrfToken:   string
  redirectTo:  string
  provider:    "discord" | "roblox"
  createdAt:   string  // ISO timestamp — states expire after 10 minutes
}

// ─── Cookie names ─────────────────────────────────────────────────────────────
// Single source of truth — imported from constants.ts in practice,
// typed here for documentation purposes.

export type AxolixCookieName =
  | "axolix_session"  // httpOnly, Secure, SameSite=Strict — 7 days rolling
  | "axolix_theme"    // Secure, SameSite=Lax — 1 year
  | "axolix_prefs"    // Secure, SameSite=Lax — 1 year
  | "axolix_oauth"    // Secure, SameSite=Lax — 10 minutes (OAuth state)
