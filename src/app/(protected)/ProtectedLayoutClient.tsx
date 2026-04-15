"use client"

/**
 * src/app/(protected)/ProtectedLayoutClient.tsx
 *
 * Client wrapper for the protected layout.
 * Sets up ServerContext and PermissionsContext providers, then renders
 * the Navbar and the page children.
 *
 * Split from layout.tsx because:
 *   - layout.tsx is a Server Component (session check, server list fetch)
 *   - Context providers require "use client"
 *   - This keeps the boundary clean and explicit
 */

import { useMemo } from "react"
import {
  ServerContext,
  useServerProvider,
} from "@/hooks/useServer"
import {
  PermissionsContext,
  usePermissionsProvider,
} from "@/hooks/usePermissions"
import type { ServerRow } from "@/types/database"
import type { SessionUser } from "@/types/auth"

interface ProtectedLayoutClientProps {
  user:           SessionUser
  initialServers: ServerRow[]
  children:       React.ReactNode
}

export function ProtectedLayoutClient({
  user,
  initialServers,
  children,
}: ProtectedLayoutClientProps) {
  // Initialise the server provider with the SSR'd server list.
  // useServerProvider() reads params from the URL to resolve the active server.
  const serverValue = useServerProvider()

  // Populate the server list once on mount (SSR data is passed as prop)
  useMemo(() => {
    serverValue.initServers(initialServers)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resolve permissions based on the active server and the current user
  const permissionsValue = usePermissionsProvider({ user })

  return (
    <ServerContext.Provider value={serverValue}>
      <PermissionsContext.Provider value={permissionsValue}>
        {/*
          Navbar goes here once built (Phase 0 deliverable).
          Placeholder div preserves layout structure until then.
        */}
        <div id="axolix-layout" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
          <div id="axolix-navbar-slot" />
          <main id="axolix-main" style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </PermissionsContext.Provider>
    </ServerContext.Provider>
  )
}
