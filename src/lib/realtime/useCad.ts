"use client"

/**
 * src/lib/realtime/useCAD.ts
 *
 * Supabase realtime subscription for cad_incidents and cad_units.
 * Channel: cad:server-[serverId]
 *
 * Powers the CAD panel live updates — both incident list and unit status.
 * Only opened when the user is actively viewing the CAD page.
 * Closed on route change via useEffect cleanup.
 *
 * Roblox linking + access_cad permission are checked in the page component
 * before this hook is mounted — this hook makes no auth assumptions.
 */

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { CadIncidentRow, CadUnitRow } from "@/types/database"

interface UseCADRealtimeOptions {
  serverId:         string
  initialIncidents?: CadIncidentRow[]
  initialUnits?:     CadUnitRow[]
}

interface UseCADRealtimeReturn {
  incidents:   CadIncidentRow[]
  units:       CadUnitRow[]
  isConnected: boolean
}

export function useCADRealtime({
  serverId,
  initialIncidents = [],
  initialUnits     = [],
}: UseCADRealtimeOptions): UseCADRealtimeReturn {
  const [incidents,   setIncidents]   = useState<CadIncidentRow[]>(initialIncidents)
  const [units,       setUnits]       = useState<CadUnitRow[]>(initialUnits)
  const [isConnected, setIsConnected] = useState(false)

  const upsertIncident = useCallback((incident: CadIncidentRow) => {
    setIncidents((prev) => {
      const idx = prev.findIndex((i) => i.id === incident.id)
      if (idx === -1) return [incident, ...prev]
      const next = [...prev]
      next[idx] = incident
      return next
    })
  }, [])

  const upsertUnit = useCallback((unit: CadUnitRow) => {
    setUnits((prev) => {
      const idx = prev.findIndex((u) => u.id === unit.id)
      if (idx === -1) return [unit, ...prev]
      const next = [...prev]
      next[idx] = unit
      return next
    })
  }, [])

  const removeUnit = useCallback((unitId: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== unitId))
  }, [])

  useEffect(() => {
    if (!serverId) return

    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`cad:server-${serverId}`)
      // Incidents
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "cad_incidents",
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            upsertIncident(payload.new as CadIncidentRow)
          }
        },
      )
      // Units
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table:  "cad_units",
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            upsertUnit(payload.new as CadUnitRow)
          } else if (payload.eventType === "DELETE") {
            removeUnit((payload.old as { id: string }).id)
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
  }, [serverId, upsertIncident, upsertUnit, removeUnit])

  // Sort incidents by priority ASC then created_at ASC (spec: priority DESC by number = high first)
  const sortedIncidents = [...incidents]
    .filter((i) => i.status !== "resolved")
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    .slice(0, 20) // spec: design for up to 20 concurrent

  return { incidents: sortedIncidents, units, isConnected }
}
