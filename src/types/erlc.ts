/**
 * src/types/erlc.ts
 *
 * Types for the ERLC (Emergency Response: Liberty County) API.
 * Consumed by the Oracle Cloud poller — not called directly from the frontend.
 * Shapes here reflect the ERLC API as documented; verify against live API
 * responses before the CAD map feature ships (coordinate support TBD).
 *
 * Note on coordinates: the spec flags coordinate support as an open decision.
 * The `position` fields below are marked optional — if the ERLC API doesn't
 * expose them, UnitMap falls back to zone-based display.
 */

// ─── Server info ──────────────────────────────────────────────────────────────

export interface ErlcServerInfo {
  /** Current player count */
  CurrentPlayers: number
  /** Server capacity */
  MaxPlayers:     number
  /** Players in the join queue */
  JoinQueue:      number
  /** Open mod calls count */
  ModCalls?:      number
  /** Server code / identifier */
  Code:           string
  /** Owner's Roblox user ID */
  OwnerId:        number
}

// ─── Players ──────────────────────────────────────────────────────────────────

export interface ErlcPlayer {
  /** Roblox player username */
  Player:   string
  /** Roblox user ID */
  UserId:   number
  /** ERLC team / role */
  Team:     ErlcTeam
  /** In-game position — only present if ERLC API supports coordinates */
  Position?: ErlcPosition
  /** Whether the player is a server staff member */
  isStaff?: boolean
}

export type ErlcTeam =
  | "Police"
  | "Sheriff"
  | "Fire"
  | "DOT"
  | "Medical"
  | "Civilian"
  | string  // ERLC may add teams — keep extensible

/** In-game world coordinates. Optional — verify ERLC API support before use. */
export interface ErlcPosition {
  x: number
  y: number  // vertical (height) in Roblox world units
  z: number
}

// ─── Bans ─────────────────────────────────────────────────────────────────────

/** A ban as stored in ERLC — sent when pushing a new ban to the API */
export interface ErlcBanPayload {
  /** Roblox user ID of the banned player */
  UserId:      number
  /** Human-readable reason shown in-game */
  Reason:      string
  /** Unix timestamp — omit for permanent */
  ExpiresAt?:  number
}

/** A ban record as returned by ERLC's ban list endpoint */
export interface ErlcBanRecord {
  UserId:      number
  Username:    string
  Reason:      string
  BannedBy:    number  // Roblox user ID of the moderator
  BannedAt:    number  // Unix timestamp
  ExpiresAt:   number | null
}

// ─── Command logs ─────────────────────────────────────────────────────────────

export interface ErlcCommandLog {
  Player:    string
  Timestamp: number  // Unix timestamp
  Command:   string
}

// ─── Kill logs ────────────────────────────────────────────────────────────────

export interface ErlcKillLog {
  Killed:    string
  Timestamp: number
  Killer:    string
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export interface ErlcVehicle {
  Name:      string
  Owner:     string
  OwnerId:   number
  /** In-game position — optional, same caveat as player positions */
  Position?: ErlcPosition
}

// ─── Poller event types ───────────────────────────────────────────────────────
// Produced by the Oracle poller and written to the Oracle server_events table.

export type ErlcEventType =
  | "player_join"
  | "player_leave"
  | "shift_start"
  | "shift_end"
  | "ban_sync"
  | "mod_call_open"
  | "mod_call_close"
  | "server_empty"
  | "player_count_spike"

export interface ErlcPollerEvent {
  serverId:  string        // Axolix server UUID
  eventType: ErlcEventType
  payload:   ErlcEventPayload
  recordedAt: string       // ISO timestamp
}

export type ErlcEventPayload =
  | { type: "player_join" | "player_leave"; player: ErlcPlayer }
  | { type: "player_count_spike"; before: number; after: number }
  | { type: "mod_call_open" | "mod_call_close"; count: number }
  | { type: "server_empty" }
  | { type: "ban_sync"; banId: string; erlcBanId?: string }
  | { type: "shift_start" | "shift_end"; userId: string; robloxId: string }

// ─── Oracle analytics API responses ──────────────────────────────────────────
// Shapes returned by the Oracle Express API to the Next.js server.

export interface ServerActivityResponse {
  serverId:  string
  timeRange: "24h" | "7d" | "30d"
  points:    ActivityPoint[]
}

export interface ActivityPoint {
  timestamp:    string  // ISO timestamp
  playerCount:  number
  staffOnDuty:  number
  modCalls:     number
}

export interface ServerStatsResponse {
  serverId:        string
  peakPlayerCount: number
  peakHour:        number  // 0–23 UTC
  avgSessionLength: number  // minutes
  totalShiftsLast7d: number
}

export interface HeatmapResponse {
  serverId: string
  page:     string
  /** 20×20 density grid — values 0–1 */
  grid:     number[][]
}
