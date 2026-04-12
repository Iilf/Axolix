/**
 * src/lib/utils/constants.ts
 *
 * Single source of truth for all app-wide constants.
 * Import from here — never hardcode these values in components or routes.
 */

import type { PermissionFlag } from "@/types/database"

// ─── Cookie names ─────────────────────────────────────────────────────────────

export const COOKIE_SESSION = "axolix_session" as const
export const COOKIE_THEME   = "axolix_theme"   as const
export const COOKIE_PREFS   = "axolix_prefs"   as const
export const COOKIE_OAUTH   = "axolix_oauth"   as const

// ─── Cookie config ────────────────────────────────────────────────────────────

export const COOKIE_SESSION_MAX_AGE = 60 * 60 * 24 * 7      // 7 days
export const COOKIE_THEME_MAX_AGE   = 60 * 60 * 24 * 365    // 1 year
export const COOKIE_PREFS_MAX_AGE   = 60 * 60 * 24 * 365    // 1 year
export const COOKIE_OAUTH_MAX_AGE   = 60 * 10               // 10 minutes

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  home:      "/",
  login:     "/login",
  verify:    "/verify",
  directory: "/directory",
  dashboard: "/dashboard",
  serverDashboard: (serverId: string) => `/dashboard/${serverId}`,
  staff:     (serverId: string) => `/dashboard/${serverId}/staff`,
  shifts:    (serverId: string) => `/dashboard/${serverId}/staff/shifts`,
  bans:      (serverId: string) => `/dashboard/${serverId}/staff/bans`,
  warnings:  (serverId: string) => `/dashboard/${serverId}/staff/warnings`,
  appeals:   (serverId: string) => `/dashboard/${serverId}/staff/appeals`,
  roles:     (serverId: string) => `/dashboard/${serverId}/staff/roles`,
  settings:  (serverId: string) => `/dashboard/${serverId}/staff/settings`,
  cad:       (serverId: string) => `/dashboard/${serverId}/cad`,
  serverProfile: (serverId: string) => `/directory/${serverId}`,
} as const

// ─── API routes ───────────────────────────────────────────────────────────────

export const API = {
  auth: {
    discordRedirect:  "/api/auth/discord/redirect",
    discordCallback:  "/api/auth/discord/callback",
    robloxRedirect:   "/api/auth/roblox/redirect",
    robloxCallback:   "/api/auth/roblox/callback",
    logout:           "/api/auth/logout",
  },
  servers:            "/api/servers",
  server:             (id: string) => `/api/servers/${id}`,
  members:            (id: string) => `/api/servers/${id}/members`,
  shifts:             (id: string) => `/api/servers/${id}/shifts`,
  shift:              (serverId: string, shiftId: string) => `/api/servers/${serverId}/shifts/${shiftId}`,
  bans:               (id: string) => `/api/servers/${id}/bans`,
  ban:                (serverId: string, banId: string) => `/api/servers/${serverId}/bans/${banId}`,
  robloxUser:         (robloxId: string) => `/api/roblox/user/${robloxId}`,
  analyticsIngest:    "/api/analytics/ingest",
} as const

// ─── Theme names ──────────────────────────────────────────────────────────────

export const DARK_THEMES  = ["dark", "midnight", "dusk", "abyss", "forest", "ember", "obsidian", "void"] as const
export const LIGHT_THEMES = ["light", "arctic", "parchment", "sage", "blossom", "frost", "pure"] as const
export const ALL_THEMES   = [...DARK_THEMES, ...LIGHT_THEMES] as const

export type ThemeName = typeof ALL_THEMES[number]
export const DEFAULT_THEME: ThemeName = "dark"

// ─── Permission flags ─────────────────────────────────────────────────────────

export const PERMISSION_FLAGS: PermissionFlag[] = [
  "manage_bans",
  "manage_shifts",
  "manage_roles",
  "manage_appeals",
  "access_cad",
  "view_analytics",
  "view_audit_logs",
]

/** Permissions every staff role gets by default regardless of config */
export const DEFAULT_PERMISSIONS: PermissionFlag[] = ["view_audit_logs"]

// ─── Directory ────────────────────────────────────────────────────────────────

/** Minimum Discord member count to appear in the directory */
export const DIRECTORY_MIN_MEMBERS = 10

export const DIRECTORY_SORT_OPTIONS = [
  { label: "Most members",  value: "member_count"   },
  { label: "Most active",   value: "activity_level" },
  { label: "Newest",        value: "created_at"     },
] as const

export const REGION_OPTIONS = [
  "NA", "EU", "ASIA", "OCE", "SA", "AF",
] as const

export const RP_STYLE_OPTIONS = [
  { label: "Serious",      value: "serious"      },
  { label: "Semi-serious", value: "semi-serious" },
  { label: "Casual",       value: "casual"       },
] as const

export const ACTIVITY_LEVEL_OPTIONS = [
  { label: "High",   value: "high"   },
  { label: "Medium", value: "medium" },
  { label: "Low",    value: "low"    },
] as const

// ─── CAD ─────────────────────────────────────────────────────────────────────

export const CAD_INCIDENT_TYPES = [
  "traffic_stop",
  "pursuit",
  "medical",
  "fire",
  "robbery",
  "disturbance",
  "accident",
  "welfare_check",
  "other",
] as const

export const CAD_MAX_CONCURRENT_INCIDENTS = 20

export const UNIT_STATUS_LABELS: Record<string, string> = {
  available:       "Available",
  busy:            "Busy",
  on_scene:        "On Scene",
  out_of_service:  "Out of Service",
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE     = 100

// ─── Shifts ───────────────────────────────────────────────────────────────────

/** Default minimum shift duration in minutes — overridden per server in settings */
export const DEFAULT_MIN_SHIFT_DURATION_MINUTES = 0

// ─── Rate limiting ────────────────────────────────────────────────────────────

export const RATE_LIMIT_AUTH_WINDOW_MS      = 60_000  // 1 minute
export const RATE_LIMIT_AUTH_MAX_REQUESTS   = 10
export const RATE_LIMIT_INGEST_WINDOW_MS    = 5_000   // 5 seconds
export const RATE_LIMIT_INGEST_MAX_EVENTS   = 100

// ─── Analytics ────────────────────────────────────────────────────────────────

/** How many events to batch before flushing to /api/analytics/ingest */
export const ANALYTICS_BATCH_SIZE    = 20
/** How many ms to wait before flushing a partial batch */
export const ANALYTICS_FLUSH_INTERVAL_MS = 5_000

// ─── External URLs ────────────────────────────────────────────────────────────

export const DISCORD_SUPPORT_URL = "https://discord.gg/FT7Bj8SsmM"

export const DISCORD_API_BASE  = "https://discord.com/api/v10"
export const DISCORD_CDN_BASE  = "https://cdn.discordapp.com"
export const DISCORD_OAUTH_URL = "https://discord.com/oauth2/authorize"
export const DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token"
export const DISCORD_SCOPES    = ["identify", "guilds"] as const

export const ROBLOX_API_BASE   = "https://apis.roblox.com"
export const ROBLOX_OAUTH_URL  = "https://apis.roblox.com/oauth/v1/authorize"
export const ROBLOX_TOKEN_URL  = "https://apis.roblox.com/oauth/v1/token"
export const ROBLOX_USERINFO_URL = "https://apis.roblox.com/oauth/v1/userinfo"
export const ROBLOX_SCOPES     = ["openid", "profile"] as const
