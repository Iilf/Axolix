/**
 * src/types/database.ts
 *
 * Hand-authored Supabase type stubs matching the full schema spec.
 * Replace this file with the output of `supabase gen types typescript`
 * once the Supabase project is fully migrated — the shape will be identical.
 *
 * Every table from the project spec is represented here, including all
 * additions from the 50-question questionnaire (warnings, ban_appeals,
 * departments, cad_units, notifications, server_reviews, server_reports).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Permission flags ────────────────────────────────────────────────────────

export type PermissionFlag =
  | "manage_bans"
  | "manage_shifts"
  | "manage_roles"
  | "manage_appeals"
  | "access_cad"
  | "view_analytics"
  | "view_audit_logs"

// ─── CAD / shift status enums ────────────────────────────────────────────────

export type IncidentStatus = "pending" | "active" | "resolved"
export type IncidentSource = "manual" | "auto"
export type IncidentPriority = 1 | 2 | 3  // 1=high, 2=normal, 3=low

export type UnitStatus = "available" | "busy" | "on_scene" | "out_of_service"

export type ShiftStatus = "active" | "ended"

// ─── Appeal / report enums ───────────────────────────────────────────────────

export type AppealStatus = "pending" | "approved" | "denied"
export type ReportStatus = "pending" | "reviewed" | "dismissed"
export type ReportReason =
  | "inappropriate_content"
  | "false_information"
  | "spam"
  | "harassment"
  | "other"

// ─── Notification types ──────────────────────────────────────────────────────

export type NotificationType =
  | "mod_call_opened"
  | "shift_ended_by_admin"
  | "ban_appeal_submitted"
  | "rank_changed"
  | "ban_created"
  | "warning_issued"

// ─── Plan types ──────────────────────────────────────────────────────────────

export type UserPlan = "free" | "pro" | "enterprise"

// ─── Database shape ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {

      // ── users ──────────────────────────────────────────────────────────────
      users: {
        Row: {
          id:               string        // uuid — Supabase auth.uid()
          discord_id:       string        // UNIQUE NOT NULL
          roblox_id:        string | null // NOT unique — multiple Discord accounts can share one Roblox ID
          discord_username: string | null
          roblox_username:  string | null
          avatar_url:       string | null
          preferences:      Json          // theme, notification settings, etc.
          plan:             UserPlan      // free | pro | enterprise
          is_superadmin:    boolean       // server-side only, never exposed to client
          created_at:       string        // timestamptz
          last_seen:        string | null // timestamptz
        }
        Insert: {
          id:               string
          discord_id:       string
          roblox_id?:       string | null
          discord_username?: string | null
          roblox_username?:  string | null
          avatar_url?:       string | null
          preferences?:      Json
          plan?:             UserPlan
          is_superadmin?:    boolean
          created_at?:       string
          last_seen?:        string | null
        }
        Update: {
          id?:               string
          discord_id?:       string
          roblox_id?:        string | null
          discord_username?: string | null
          roblox_username?:  string | null
          avatar_url?:       string | null
          preferences?:      Json
          plan?:             UserPlan
          is_superadmin?:    boolean
          created_at?:       string
          last_seen?:        string | null
        }
      }

      // ── servers ────────────────────────────────────────────────────────────
      servers: {
        Row: {
          id:               string        // uuid
          discord_guild_id: string        // UNIQUE NOT NULL
          owner_id:         string | null // uuid → users.id
          name:             string
          description:      string | null
          icon_url:         string | null
          member_count:     number
          verified:         boolean
          listed:           boolean       // opt-out directory listing, default true
          featured:         boolean       // pinned above organic results
          region:           string | null // e.g. "EU", "NA", "ASIA"
          rp_style:         string | null // e.g. "serious", "semi-serious", "casual"
          activity_level:   string | null // e.g. "high", "medium", "low"
          settings:         Json          // per-server config (rank colours, timezone, etc.)
          created_at:       string        // timestamptz
        }
        Insert: {
          id?:              string
          discord_guild_id: string
          owner_id?:        string | null
          name:             string
          description?:     string | null
          icon_url?:        string | null
          member_count?:    number
          verified?:        boolean
          listed?:          boolean
          featured?:        boolean
          region?:          string | null
          rp_style?:        string | null
          activity_level?:  string | null
          settings?:        Json
          created_at?:      string
        }
        Update: {
          id?:              string
          discord_guild_id?: string
          owner_id?:        string | null
          name?:            string
          description?:     string | null
          icon_url?:        string | null
          member_count?:    number
          verified?:        boolean
          listed?:          boolean
          featured?:        boolean
          region?:          string | null
          rp_style?:        string | null
          activity_level?:  string | null
          settings?:        Json
          created_at?:      string
        }
      }

      // ── server_members ─────────────────────────────────────────────────────
      server_members: {
        Row: {
          id:        string        // uuid
          server_id: string        // uuid → servers.id
          user_id:   string        // uuid → users.id
          role_id:   string | null // uuid → staff_roles.id
          joined_at: string        // timestamptz
        }
        Insert: {
          id?:       string
          server_id: string
          user_id:   string
          role_id?:  string | null
          joined_at?: string
        }
        Update: {
          id?:       string
          server_id?: string
          user_id?:   string
          role_id?:   string | null
          joined_at?: string
        }
      }

      // ── staff_roles ────────────────────────────────────────────────────────
      staff_roles: {
        Row: {
          id:          string           // uuid
          server_id:   string           // uuid → servers.id
          name:        string
          color:       string           // hex colour code
          rank_order:  number           // lower = higher rank
          permissions: PermissionFlag[]
          created_at:  string           // timestamptz
        }
        Insert: {
          id?:         string
          server_id:   string
          name:        string
          color?:      string
          rank_order:  number
          permissions?: PermissionFlag[]
          created_at?: string
        }
        Update: {
          id?:         string
          server_id?:  string
          name?:       string
          color?:      string
          rank_order?: number
          permissions?: PermissionFlag[]
          created_at?: string
        }
      }

      // ── shifts ─────────────────────────────────────────────────────────────
      shifts: {
        Row: {
          id:         string        // uuid
          server_id:  string        // uuid → servers.id
          user_id:    string        // uuid → users.id
          started_at: string        // timestamptz
          ended_at:   string | null // null = shift is active
          notes:      string | null
        }
        Insert: {
          id?:        string
          server_id:  string
          user_id:    string
          started_at?: string
          ended_at?:  string | null
          notes?:     string | null
        }
        Update: {
          id?:        string
          server_id?: string
          user_id?:   string
          started_at?: string
          ended_at?:  string | null
          notes?:     string | null
        }
      }

      // ── bans ───────────────────────────────────────────────────────────────
      bans: {
        Row: {
          id:               string        // uuid
          server_id:        string        // uuid → servers.id
          target_roblox_id: string        // NOT NULL — banned player's Roblox ID
          target_username:  string | null
          reason:           string | null
          evidence_url:     string | null // URL only — no file uploads
          issued_by:        string | null // uuid → users.id
          issued_at:        string        // timestamptz
          expires_at:       string | null // null = permanent
          active:           boolean
          synced:           boolean       // whether pushed to ERLC API successfully
          sync_error:       string | null // error message if synced = false
        }
        Insert: {
          id?:              string
          server_id:        string
          target_roblox_id: string
          target_username?:  string | null
          reason?:           string | null
          evidence_url?:     string | null
          issued_by?:        string | null
          issued_at?:        string
          expires_at?:       string | null
          active?:           boolean
          synced?:           boolean
          sync_error?:       string | null
        }
        Update: {
          id?:              string
          server_id?:       string
          target_roblox_id?: string
          target_username?:  string | null
          reason?:           string | null
          evidence_url?:     string | null
          issued_by?:        string | null
          issued_at?:        string
          expires_at?:       string | null
          active?:           boolean
          synced?:           boolean
          sync_error?:       string | null
        }
      }

      // ── warnings ───────────────────────────────────────────────────────────
      // Mirrors bans structure but no ERLC API sync.
      warnings: {
        Row: {
          id:               string        // uuid
          server_id:        string        // uuid → servers.id
          target_roblox_id: string
          target_username:  string | null
          reason:           string | null
          evidence_url:     string | null
          issued_by:        string | null // uuid → users.id
          issued_at:        string        // timestamptz
          active:           boolean
        }
        Insert: {
          id?:              string
          server_id:        string
          target_roblox_id: string
          target_username?:  string | null
          reason?:           string | null
          evidence_url?:     string | null
          issued_by?:        string | null
          issued_at?:        string
          active?:           boolean
        }
        Update: {
          id?:              string
          server_id?:       string
          target_roblox_id?: string
          target_username?:  string | null
          reason?:           string | null
          evidence_url?:     string | null
          issued_by?:        string | null
          issued_at?:        string
          active?:           boolean
        }
      }

      // ── ban_appeals ────────────────────────────────────────────────────────
      // Public-facing — no login required to submit. Opt-in per server.
      ban_appeals: {
        Row: {
          id:          string        // uuid
          ban_id:      string        // uuid → bans.id
          roblox_id:   string        // appealing player's Roblox ID
          reason:      string | null
          status:      AppealStatus  // pending | approved | denied
          reviewed_by: string | null // uuid → users.id
          created_at:  string        // timestamptz
          reviewed_at: string | null // timestamptz
        }
        Insert: {
          id?:         string
          ban_id:      string
          roblox_id:   string
          reason?:     string | null
          status?:     AppealStatus
          reviewed_by?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?:         string
          ban_id?:     string
          roblox_id?:  string
          reason?:     string | null
          status?:     AppealStatus
          reviewed_by?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
      }

      // ── audit_logs ─────────────────────────────────────────────────────────
      // Append-only. Never updated, never deleted in normal operation.
      audit_logs: {
        Row: {
          id:         string        // uuid
          server_id:  string        // uuid → servers.id
          actor_id:   string | null // uuid → users.id
          action:     string        // e.g. "ban.create", "shift.end", "role.update"
          target_id:  string | null // polymorphic: ban id, user id, etc.
          details:    Json | null   // before/after state for reversible actions
          created_at: string        // timestamptz
        }
        Insert: {
          id?:        string
          server_id:  string
          actor_id?:  string | null
          action:     string
          target_id?: string | null
          details?:   Json | null
          created_at?: string
        }
        Update: never // append-only
      }

      // ── cad_incidents ──────────────────────────────────────────────────────
      cad_incidents: {
        Row: {
          id:          string           // uuid
          server_id:   string           // uuid → servers.id
          type:        string           // "traffic_stop" | "pursuit" | "medical" | etc.
          status:      IncidentStatus   // pending | active | resolved
          priority:    IncidentPriority // 1=high, 2=normal, 3=low
          source:      IncidentSource   // manual | auto
          description: string | null
          location:    string | null
          units:       string[]         // array of user uuids
          created_by:  string | null    // uuid → users.id
          created_at:  string           // timestamptz
          resolved_at: string | null    // timestamptz
        }
        Insert: {
          id?:         string
          server_id:   string
          type:        string
          status?:     IncidentStatus
          priority?:   IncidentPriority
          source?:     IncidentSource
          description?: string | null
          location?:   string | null
          units?:      string[]
          created_by?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?:         string
          server_id?:  string
          type?:       string
          status?:     IncidentStatus
          priority?:   IncidentPriority
          source?:     IncidentSource
          description?: string | null
          location?:   string | null
          units?:      string[]
          created_by?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }

      // ── cad_units ──────────────────────────────────────────────────────────
      // Live unit status — updated via realtime on cad:server-[serverId].
      cad_units: {
        Row: {
          id:            string        // uuid
          server_id:     string        // uuid → servers.id
          user_id:       string        // uuid → users.id
          roblox_id:     string
          status:        UnitStatus    // available | busy | on_scene | out_of_service
          department_id: string | null // uuid → departments.id
          updated_at:    string        // timestamptz
        }
        Insert: {
          id?:           string
          server_id:     string
          user_id:       string
          roblox_id:     string
          status?:       UnitStatus
          department_id?: string | null
          updated_at?:   string
        }
        Update: {
          id?:           string
          server_id?:    string
          user_id?:      string
          roblox_id?:    string
          status?:       UnitStatus
          department_id?: string | null
          updated_at?:   string
        }
      }

      // ── departments ────────────────────────────────────────────────────────
      // CAD department config — optional, owner-configured.
      departments: {
        Row: {
          id:              string   // uuid
          server_id:       string   // uuid → servers.id
          name:            string   // e.g. "LCSO", "LCFD"
          type:            string   // "police" | "fire" | "ems" | "civilian"
          color:           string   // hex colour for UI
          member_role_ids: string[] // staff_role uuids whose members belong to this dept
        }
        Insert: {
          id?:             string
          server_id:       string
          name:            string
          type:            string
          color?:          string
          member_role_ids?: string[]
        }
        Update: {
          id?:             string
          server_id?:      string
          name?:           string
          type?:           string
          color?:          string
          member_role_ids?: string[]
        }
      }

      // ── notifications ──────────────────────────────────────────────────────
      notifications: {
        Row: {
          id:           string              // uuid
          user_id:      string              // uuid → users.id
          server_id:    string | null       // uuid → servers.id
          type:         NotificationType
          body:         string
          read:         boolean
          resource_url: string | null       // deep-link to the relevant resource
          created_at:   string             // timestamptz
        }
        Insert: {
          id?:          string
          user_id:      string
          server_id?:   string | null
          type:         NotificationType
          body:         string
          read?:        boolean
          resource_url?: string | null
          created_at?:  string
        }
        Update: {
          id?:          string
          user_id?:     string
          server_id?:   string | null
          type?:        NotificationType
          body?:        string
          read?:        boolean
          resource_url?: string | null
          created_at?:  string
        }
      }

      // ── server_reviews ─────────────────────────────────────────────────────
      // Auth-gated. One review per user per server, editable.
      server_reviews: {
        Row: {
          id:         string  // uuid
          server_id:  string  // uuid → servers.id
          user_id:    string  // uuid → users.id
          rating:     number  // 1–5
          body:       string | null
          created_at: string  // timestamptz
          updated_at: string  // timestamptz
        }
        Insert: {
          id?:        string
          server_id:  string
          user_id:    string
          rating:     number
          body?:      string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?:        string
          server_id?: string
          user_id?:   string
          rating?:    number
          body?:      string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ── server_reports ─────────────────────────────────────────────────────
      // Goes to superadmin moderation queue, not server owner.
      server_reports: {
        Row: {
          id:          string        // uuid
          server_id:   string        // uuid → servers.id
          reported_by: string | null // uuid → users.id
          reason:      ReportReason
          details:     string | null
          status:      ReportStatus  // pending | reviewed | dismissed
          created_at:  string        // timestamptz
        }
        Insert: {
          id?:         string
          server_id:   string
          reported_by?: string | null
          reason:      ReportReason
          details?:    string | null
          status?:     ReportStatus
          created_at?: string
        }
        Update: {
          id?:         string
          server_id?:  string
          reported_by?: string | null
          reason?:     ReportReason
          details?:    string | null
          status?:     ReportStatus
          created_at?: string
        }
      }

    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      [_ in never]: never
    }
  }
}

// ─── Convenience row type aliases ────────────────────────────────────────────
// Use these throughout the app instead of Database["public"]["Tables"]["x"]["Row"]

export type UserRow          = Database["public"]["Tables"]["users"]["Row"]
export type ServerRow        = Database["public"]["Tables"]["servers"]["Row"]
export type ServerMemberRow  = Database["public"]["Tables"]["server_members"]["Row"]
export type StaffRoleRow     = Database["public"]["Tables"]["staff_roles"]["Row"]
export type ShiftRow         = Database["public"]["Tables"]["shifts"]["Row"]
export type BanRow           = Database["public"]["Tables"]["bans"]["Row"]
export type WarningRow       = Database["public"]["Tables"]["warnings"]["Row"]
export type BanAppealRow     = Database["public"]["Tables"]["ban_appeals"]["Row"]
export type AuditLogRow      = Database["public"]["Tables"]["audit_logs"]["Row"]
export type CadIncidentRow   = Database["public"]["Tables"]["cad_incidents"]["Row"]
export type CadUnitRow       = Database["public"]["Tables"]["cad_units"]["Row"]
export type DepartmentRow    = Database["public"]["Tables"]["departments"]["Row"]
export type NotificationRow  = Database["public"]["Tables"]["notifications"]["Row"]
export type ServerReviewRow  = Database["public"]["Tables"]["server_reviews"]["Row"]
export type ServerReportRow  = Database["public"]["Tables"]["server_reports"]["Row"]

// Insert/Update aliases
export type UserInsert         = Database["public"]["Tables"]["users"]["Insert"]
export type ServerInsert       = Database["public"]["Tables"]["servers"]["Insert"]
export type ShiftInsert        = Database["public"]["Tables"]["shifts"]["Insert"]
export type BanInsert          = Database["public"]["Tables"]["bans"]["Insert"]
export type WarningInsert      = Database["public"]["Tables"]["warnings"]["Insert"]
export type BanAppealInsert    = Database["public"]["Tables"]["ban_appeals"]["Insert"]
export type CadIncidentInsert  = Database["public"]["Tables"]["cad_incidents"]["Insert"]
export type CadUnitInsert      = Database["public"]["Tables"]["cad_units"]["Insert"]
export type DepartmentInsert   = Database["public"]["Tables"]["departments"]["Insert"]
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"]
export type ServerReviewInsert = Database["public"]["Tables"]["server_reviews"]["Insert"]
export type ServerReportInsert = Database["public"]["Tables"]["server_reports"]["Insert"]

export type ShiftUpdate       = Database["public"]["Tables"]["shifts"]["Update"]
export type BanUpdate         = Database["public"]["Tables"]["bans"]["Update"]
export type BanAppealUpdate   = Database["public"]["Tables"]["ban_appeals"]["Update"]
export type CadIncidentUpdate = Database["public"]["Tables"]["cad_incidents"]["Update"]
export type CadUnitUpdate     = Database["public"]["Tables"]["cad_units"]["Update"]
