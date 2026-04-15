"use client"

/**
 * src/hooks/useServer.ts
 *
 * Active server context — tracks which server the user is currently operating in.
 * Syncs with the URL slug /dashboard/[serverId]/ so deep-linked pages always
 * open in the correct server context.
 *
 * A user can belong to multiple servers. The active server drives:
 *   - Which data is fetched in staff/CAD panels
 *   - Which permissions are resolved by usePermissions()
 *   - The server switcher selection in the navbar
 *
 * The context is held in React state (not a cookie) — it is derived from the URL
 * and does not need to survive page refreshes, since the URL already encodes it.
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { ROUTES } from "@/lib/utils/constants"
import type { ServerRow } from "@/types/database"

// ─── Context ──────────────────────────────────────────────────────────────────

interface ServerContextValue {
  /** The active server, or null if on the profile home (/dashboard) */
  activeServer:    ServerRow | null
  activeServerId:  string | null
  /** List of servers the user belongs to — populated by the layout */
  userServers:     ServerRow[]
  setUserServers:  (servers: ServerRow[]) => void
  /** Switch to a different server — navigates to /dashboard/[id] */
  switchServer:    (serverId: string) => void
  isLoading:       boolean
}

export const ServerContext = createContext<ServerContextValue>({
  activeServer:   null,
  activeServerId: null,
  userServers:    [],
  setUserServers: () => {},
  switchServer:   () => {},
  isLoading:      false,
})

// ─── Provider state — used in (protected)/layout.tsx ─────────────────────────

interface UseServerProviderReturn extends ServerContextValue {
  // Exposed for the layout to initialise server list from server-side data
  initServers: (servers: ServerRow[]) => void
}

export function useServerProvider(): UseServerProviderReturn {
  const params   = useParams<{ serverId?: string }>()
  const router   = useRouter()
  const pathname = usePathname()

  const [userServers,    setUserServers]    = useState<ServerRow[]>([])
  const [activeServer,   setActiveServer]   = useState<ServerRow | null>(null)
  const [isLoading,      setIsLoading]      = useState(false)

  const activeServerId = params?.serverId ?? null

  // Resolve active server from the URL slug whenever it or the server list changes
  useEffect(() => {
    if (!activeServerId) {
      setActiveServer(null)
      return
    }

    const found = userServers.find((s) => s.id === activeServerId)
    if (found) {
      setActiveServer(found)
      return
    }

    // Not in local list — fetch from API
    setIsLoading(true)
    fetch(`/api/servers/${activeServerId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.server) setActiveServer(json.server)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [activeServerId, userServers])

  const switchServer = useCallback(
    (serverId: string) => {
      if (serverId === activeServerId) return

      // Determine which sub-page to land on after switching.
      // If the user is on /dashboard/[old]/staff/bans, land on /dashboard/[new]/staff/bans
      const subPath = pathname.replace(`/dashboard/${activeServerId}`, "") || ""
      router.push(ROUTES.serverDashboard(serverId) + subPath)
    },
    [activeServerId, pathname, router],
  )

  const initServers = useCallback((servers: ServerRow[]) => {
    setUserServers(servers)
  }, [])

  return {
    activeServer,
    activeServerId,
    userServers,
    setUserServers,
    switchServer,
    isLoading,
    initServers,
  }
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

/**
 * Returns the active server context.
 * Must be used inside the ServerContext.Provider set up in (protected)/layout.tsx.
 */
export function useServer(): ServerContextValue {
  return useContext(ServerContext)
}
