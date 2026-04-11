/**
 * src/types/api.ts
 *
 * Request and response shapes for all Next.js API route handlers.
 * These are the contracts between the frontend and /app/api/*.
 *
 * Convention:
 *   - *Request  = body sent by the client
 *   - *Response = body returned by the server (on success)
 *   - ApiError  = shape returned on any error
 */

import type {
  UserRow,
  ServerRow,
  ServerMemberRow,
  StaffRoleRow,
  ShiftRow,
  BanRow,
  WarningRow,
  BanAppealRow,
  AuditLogRow,
  CadIncidentRow,
  CadUnitRow,
  NotificationRow,
  ServerReviewRow,
  IncidentStatus,
  IncidentPriority,
  AppealStatus,
  PermissionFlag,
} from "@/types/database"

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Every API error response follows this shape */
export interface ApiError {
  error:   string   // human-readable message
  code?:   string   // machine-readable code e.g. "UNAUTHORISED", "NOT_FOUND"
  status:  number   // HTTP status code
}

/** Generic paginated list wrapper */
export interface PaginatedResponse<T> {
  data:     T[]
  total:    number
  page:     number
  pageSize: number
  hasMore:  boolean
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

// GET /api/auth/discord/redirect → 302 redirect (no body)
// GET /api/auth/discord/callback → 302 redirect (no body)
// GET /api/auth/roblox/redirect  → 302 redirect (no body)
// GET /api/auth/roblox/callback  → 302 redirect (no body)

// POST /api/auth/logout
export interface LogoutResponse {
  success: true
}

// ─── Servers ──────────────────────────────────────────────────────────────────

// GET /api/servers
export interface GetServersRequest {
  search?:        string
  region?:        string
  rpStyle?:       string
  activityLevel?: string
  featured?:      boolean
  page?:          number
  pageSize?:      number
  sort?:          "member_count" | "activity_level" | "created_at"
}

export type GetServersResponse = PaginatedResponse<ServerRow>

// POST /api/servers
export interface CreateServerRequest {
  discordGuildId: string
}

export interface CreateServerResponse {
  server: ServerRow
}

// GET /api/servers/[id]
export interface GetServerResponse {
  server:  ServerRow
  reviews: ServerReviewSummary
}

export interface ServerReviewSummary {
  averageRating: number
  totalReviews:  number
}

// GET /api/servers/[id]/members
export type GetMembersResponse = PaginatedResponse<ServerMemberWithUser>

export interface ServerMemberWithUser extends ServerMemberRow {
  user: Pick<UserRow, "id" | "discord_username" | "roblox_username" | "avatar_url">
  role: Pick<StaffRoleRow, "id" | "name" | "color" | "rank_order"> | null
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

// GET /api/servers/[id]/shifts
export interface GetShiftsRequest {
  userId?:   string
  active?:   boolean
  page?:     number
  pageSize?: number
}

export type GetShiftsResponse = PaginatedResponse<ShiftWithUser>

export interface ShiftWithUser extends ShiftRow {
  user: Pick<UserRow, "id" | "discord_username" | "roblox_username" | "avatar_url">
  /** Duration in seconds — null if shift is still active */
  durationSeconds: number | null
}

// POST /api/servers/[id]/shifts
export interface StartShiftRequest {
  // No body required — user and server derived from session + URL param
}

export interface StartShiftResponse {
  shift: ShiftRow
}

// PATCH /api/servers/[id]/shifts/[shiftId]
export interface EndShiftRequest {
  notes?: string
}

export interface EndShiftResponse {
  shift: ShiftRow
}

// ─── Bans ─────────────────────────────────────────────────────────────────────

// GET /api/servers/[id]/bans (includes warnings in combined view)
export interface GetBansRequest {
  search?:    string  // Roblox username search
  active?:    boolean
  page?:      number
  pageSize?:  number
}

export type GetBansResponse = PaginatedResponse<BanWithIssuer>

export interface BanWithIssuer extends BanRow {
  issuedByUser: Pick<UserRow, "id" | "discord_username" | "avatar_url"> | null
}

// POST /api/servers/[id]/bans
export interface CreateBanRequest {
  targetRobloxId: string
  targetUsername?: string
  reason?:         string
  evidenceUrl?:    string
  expiresAt?:      string  // ISO timestamp — omit for permanent
}

export interface CreateBanResponse {
  ban:    BanRow
  synced: boolean  // whether ERLC API push succeeded immediately
}

// PATCH /api/servers/[id]/bans/[banId]
export interface UpdateBanRequest {
  active?:     boolean
  reason?:     string
  evidenceUrl?: string
  expiresAt?:  string | null
}

export interface UpdateBanResponse {
  ban: BanRow
}

// ─── Warnings ────────────────────────────────────────────────────────────────

export interface CreateWarningRequest {
  targetRobloxId: string
  targetUsername?: string
  reason?:         string
  evidenceUrl?:    string
}

export interface CreateWarningResponse {
  warning: WarningRow
}

// ─── Ban appeals ─────────────────────────────────────────────────────────────

export interface CreateAppealRequest {
  banId:    string
  robloxId: string
  reason:   string
}

export interface CreateAppealResponse {
  appeal: BanAppealRow
}

export interface ReviewAppealRequest {
  status:      AppealStatus
  reviewNotes?: string
}

export interface ReviewAppealResponse {
  appeal: BanAppealRow
}

// ─── Audit logs ───────────────────────────────────────────────────────────────

export interface GetAuditLogsRequest {
  action?:   string
  actorId?:  string
  page?:     number
  pageSize?: number
}

export type GetAuditLogsResponse = PaginatedResponse<AuditLogWithActor>

export interface AuditLogWithActor extends AuditLogRow {
  actor: Pick<UserRow, "id" | "discord_username" | "avatar_url"> | null
}

// ─── CAD ─────────────────────────────────────────────────────────────────────

export interface GetIncidentsResponse {
  incidents: CadIncidentRow[]
  units:     CadUnitRow[]
}

export interface CreateIncidentRequest {
  type:         string
  priority?:    IncidentPriority
  description?: string
  location?:    string
  units?:       string[]
}

export interface CreateIncidentResponse {
  incident: CadIncidentRow
}

export interface UpdateIncidentRequest {
  status?:      IncidentStatus
  priority?:    IncidentPriority
  description?: string
  location?:    string
  units?:       string[]
}

export interface UpdateUnitStatusRequest {
  status:        CadUnitRow["status"]
  departmentId?: string | null
}

// ─── Staff roles ──────────────────────────────────────────────────────────────

export interface CreateRoleRequest {
  name:        string
  color:       string
  rankOrder:   number
  permissions: PermissionFlag[]
}

export interface UpdateRoleRequest {
  name?:        string
  color?:       string
  rankOrder?:   number
  permissions?: PermissionFlag[]
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface GetNotificationsResponse {
  notifications: NotificationRow[]
  unreadCount:   number
}

export interface MarkNotificationsReadRequest {
  ids: string[]  // notification UUIDs to mark as read
}

// ─── Roblox proxy ────────────────────────────────────────────────────────────

// GET /api/roblox/user/[robloxId]
export interface RobloxUserResponse {
  id:          string
  username:    string
  displayName: string
  avatarUrl:   string | null
}

// ─── Analytics ingest ────────────────────────────────────────────────────────

// POST /api/analytics/ingest
export interface AnalyticsEvent {
  page:      string
  eventType: "click" | "hover" | "scroll" | "view"
  xPct?:     number  // 0–100 percentage of viewport width
  yPct?:     number  // 0–100 percentage of viewport height
  metadata?: Record<string, string | number | boolean>
}

export interface IngestEventsRequest {
  events:   AnalyticsEvent[]
  serverId?: string | null
}

export interface IngestEventsResponse {
  accepted: number
}

// ─── Server reviews ──────────────────────────────────────────────────────────

export interface CreateReviewRequest {
  rating: number  // 1–5
  body?:  string
}

export interface GetReviewsResponse {
  reviews: ServerReviewRow[]
  summary: {
    averageRating: number
    totalReviews:  number
    distribution:  Record<1 | 2 | 3 | 4 | 5, number>
  }
}

// ─── Server reports ──────────────────────────────────────────────────────────

export interface CreateReportRequest {
  reason:   ServerReportRow["reason"]
  details?: string
}
