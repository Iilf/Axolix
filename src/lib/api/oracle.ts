/**
 * src/lib/api/oracle.ts
 *
 * Oracle Cloud analytics API wrapper — server-side only.
 * Never called from the browser. The Next.js server calls this and proxies
 * results to the client, keeping the Oracle API URL and secret off the client.
 *
 * The Oracle API lives on a private port and requires a shared secret header.
 * Requests without the correct header are rejected by the Oracle Express server.
 */

import type {
  ServerActivityResponse,
  ServerStatsResponse,
  HeatmapResponse,
  ErlcPollerEvent,
} from "@/types/erlc"
import type { IngestEventsRequest } from "@/types/api"

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function oracleFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.ORACLE_API_URL
  const secret  = process.env.ORACLE_API_SECRET

  if (!baseUrl || !secret) {
    throw new Error("ORACLE_API_URL or ORACLE_API_SECRET environment variable is not set")
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type":    "application/json",
      "X-Oracle-Secret": secret,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Oracle API error ${res.status} on ${path}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ─── Analytics reads ──────────────────────────────────────────────────────────

/**
 * Fetches the activity timeline for a server.
 * Used on the analytics page — data is refreshed every 5 minutes by Oracle.
 *
 * @param serverId - Axolix server UUID
 * @param timeRange - Data window: last 24h, 7d, or 30d
 */
export async function getServerActivity(
  serverId:  string,
  timeRange: "24h" | "7d" | "30d" = "24h",
): Promise<ServerActivityResponse> {
  return oracleFetch<ServerActivityResponse>(
    `/analytics/server/${serverId}/activity?range=${timeRange}`,
  )
}

/**
 * Fetches aggregated stats for a server.
 * Peak hours, average session length, shift counts, etc.
 */
export async function getServerStats(serverId: string): Promise<ServerStatsResponse> {
  return oracleFetch<ServerStatsResponse>(
    `/analytics/server/${serverId}/stats`,
  )
}

/**
 * Fetches the precomputed heatmap density matrix for a page.
 * Data is a 20×20 grid of normalised density values (0–1).
 * Raw heatmap points are never sent to the client — only the precomputed grid.
 *
 * @param serverId - Axolix server UUID
 * @param page     - Page path e.g. "/dashboard", "/staff/bans"
 */
export async function getHeatmap(
  serverId: string,
  page:     string,
): Promise<HeatmapResponse> {
  return oracleFetch<HeatmapResponse>(
    `/analytics/server/${serverId}/heatmap?page=${encodeURIComponent(page)}`,
  )
}

// ─── Analytics writes ─────────────────────────────────────────────────────────

/**
 * Forwards a batch of frontend analytics events to Oracle for ingestion.
 * Called by /api/analytics/ingest after stripping PII and validating the session.
 */
export async function ingestEvents(payload: IngestEventsRequest): Promise<{ accepted: number }> {
  return oracleFetch<{ accepted: number }>("/events/ingest", {
    method: "POST",
    body:   JSON.stringify(payload),
  })
}

/**
 * Forwards a poller event from the Oracle poller process to the ingestion pipeline.
 * This is called by the Oracle-side Node.js process, not from Next.js — included
 * here for type completeness and potential future use.
 */
export async function ingestPollerEvent(event: ErlcPollerEvent): Promise<void> {
  await oracleFetch<void>("/events/ingest", {
    method: "POST",
    body:   JSON.stringify(event),
  })
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export interface SystemLogEntry {
  id:        number
  level:     "debug" | "info" | "warn" | "error"
  service:   string
  message:   string
  metadata:  Record<string, unknown>
  createdAt: string
}

export interface GetLogsOptions {
  level?:   SystemLogEntry["level"]
  service?: string
  limit?:   number
  before?:  string  // ISO timestamp — returns logs before this point
}

/**
 * Fetches system logs from Oracle.
 * Internal ops only — never called on behalf of end users.
 * Requires superadmin session check before calling.
 */
export async function getSystemLogs(options: GetLogsOptions = {}): Promise<SystemLogEntry[]> {
  const params = new URLSearchParams()
  if (options.level)   params.set("level",   options.level)
  if (options.service) params.set("service", options.service)
  if (options.limit)   params.set("limit",   String(options.limit))
  if (options.before)  params.set("before",  options.before)

  const query = params.toString()
  return oracleFetch<SystemLogEntry[]>(`/logs/system${query ? `?${query}` : ""}`)
}
