"use client"

/**
 * src/lib/realtime/useActivityFeed.ts
 *
 * Supabase realtime subscription for the activity feed ticker on the dashboard.
 * Channel: activity:server-[serverId]
 *
 * Listens on a lightweight activity_feed table — event name + timestamp only,
 * no PII. Keeps a rolling window of the last N events in memory.
 *
 * Note: the activity_feed table is a thin append-only event log written by the
 * API layer whenever meaningful actions occur (shift start/end, ban, etc.).
 * It is separate from audit_logs which store full action details.
 */

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export interface ActivityEvent {
  id:         string
  server_id:  string
  event_type: string  // "shift_started" | "ban_issued" | "role_updated" | etc.
  label:      string  // human-readable — pre-formatted by the API
  created_at: string  // ISO timestamp
}

interface UseActivityFeedOptions {
  serverId:       string
  maxEvents?:     number  // rolling window size, default 20
  initialEvents?: ActivityEvent[]
}

interface UseActivityFeedReturn {
  events:      ActivityEvent[]
  isConnected: boolean
  /** Manually append a local event (e.g. after a user action) before the DB fires */
  pushLocal:   (event: Omit<ActivityEvent, "id" | "server_id">) => void
}

export function useActivityFeed({
  serverId,
  maxEvents     = 20,
  initialEvents = [],
}: UseActivityFeedOptions): UseActivityFeedReturn {
  const [events,      setEvents]      = useState<ActivityEvent[]>(initialEvents)
  const [isConnected, setIsConnected] = useState(false)

  const prepend = useCallback(
    (event: ActivityEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents))
    },
    [maxEvents],
  )

  const pushLocal = useCallback(
    (event: Omit<ActivityEvent, "id" | "server_id">) => {
      prepend({
        ...event,
        id:        crypto.randomUUID(),
        server_id: serverId,
      })
    },
    [prepend, serverId],
  )

  useEffect(() => {
    if (!serverId) return

    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`activity:server-${serverId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "activity_feed",
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          prepend(payload.new as ActivityEvent)
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [serverId, prepend])

  return { events, isConnected, pushLocal }
}
