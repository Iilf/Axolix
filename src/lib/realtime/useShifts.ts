"use client"

/**
 * src/lib/realtime/useShifts.ts
 *
 * Supabase realtime subscription for the shifts table.
 * Channel: shifts:server-[serverId]
 *
 * Opens on mount, closes on unmount (route change cleanup).
 * Only used on pages that actually need live shift data — do not open
 * this subscription globally. Idle realtime connections waste quota.
 */

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ShiftRow } from "@/types/database"

interface UseShiftsRealtimeOptions {
  serverId: string
  /** Seed with server-rendered data so the first paint is instant */
  initialShifts?: ShiftRow[]
}

interface UseShiftsRealtimeReturn {
  activeShifts: ShiftRow[]   // shifts with ended_at === null
  recentShifts: ShiftRow[]   // shifts ended in the last hour
  isConnected:  boolean
}

export function useShiftsRealtime({
  serverId,
  initialShifts = [],
}: UseShiftsRealtimeOptions): UseShiftsRealtimeReturn {
  const [shifts,      setShifts]      = useState<ShiftRow[]>(initialShifts)
  const [isConnected, setIsConnected] = useState(false)

  const upsertShift = useCallback((shift: ShiftRow) => {
    setShifts((prev) => {
      const idx = prev.findIndex((s) => s.id === shift.id)
      if (idx === -1) return [shift, ...prev]
      const next = [...prev]
      next[idx] = shift
      return next
    })
  }, [])

  useEffect(() => {
    if (!serverId) return

    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`shifts:server-${serverId}`)
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "shifts",
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            upsertShift(payload.new as ShiftRow)
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [serverId, upsertShift])

  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  const activeShifts = shifts.filter((s) => s.ended_at === null)
  const recentShifts = shifts.filter(
    (s) =>
      s.ended_at !== null &&
      new Date(s.ended_at).getTime() > oneHourAgo,
  )

  return { activeShifts, recentShifts, isConnected }
}
