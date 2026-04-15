"use client"

/**
 * src/hooks/usePermissions.ts
 *
 * Role-based permission checks for the active server context.
 *
 * Permissions are per-role flags defined by the server owner — there is no
 * additive stacking. Each role has an explicit set of permission flags.
 * The user's role (and therefore their permissions) can change in real time
 * via Discord role sync — this hook re-fetches when the active server changes.
 *
 * Usage:
 *   const { can, isOwner, isStaff, role } = usePermissions()
 *   if (can("manage_bans")) { ... }
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { useServer } from "@/hooks/useServer"
import { DEFAULT_PERMISSIONS } from "@/lib/utils/constants"
import type { PermissionFlag, StaffRoleRow } from "@/types/database"
import type { SessionUser } from "@/types/auth"

// ─── Context ──────────────────────────────────────────────────────────────────

interface PermissionsContextValue {
  /** Check if the user has a specific permission flag */
  can:        (flag: PermissionFlag) => boolean
  /** Whether the user is the server owner */
  isOwner:    boolean
  /** Whether the user has any staff role at all */
  isStaff:    boolean
  /** Whether the user is a platform superadmin */
  isSuperadmin: boolean
  /** The user's current role in the active server, if any */
  role:       StaffRoleRow | null
  /** Raw permission flags — prefer can() for checks */
  permissions: PermissionFlag[]
  isLoading:   boolean
}

const defaultPermissions: PermissionsContextValue = {
  can:          () => false,
  isOwner:      false,
  isStaff:      false,
  isSuperadmin: false,
  role:         null,
  permissions:  [],
  isLoading:    false,
}

export const PermissionsContext = createContext<PermissionsContextValue>(defaultPermissions)

// ─── Provider state — used in (protected)/layout.tsx ─────────────────────────

interface UsePermissionsProviderOptions {
  user: SessionUser | null
}

export function usePermissionsProvider({ user }: UsePermissionsProviderOptions): PermissionsContextValue {
  const { activeServerId, activeServer } = useServer()

  const [role,       setRole]       = useState<StaffRoleRow | null>(null)
  const [isLoading,  setIsLoading]  = useState(false)

  // Superadmins bypass all permission checks
  const isSuperadmin = user?.isSuperadmin ?? false

  useEffect(() => {
    if (!user || !activeServerId) {
      setRole(null)
      return
    }

    // Superadmins don't need a role resolved — can() always returns true
    if (isSuperadmin) return

    setIsLoading(true)

    fetch(`/api/servers/${activeServerId}/members/me`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        setRole(json?.role ?? null)
      })
      .catch(() => setRole(null))
      .finally(() => setIsLoading(false))
  }, [user, activeServerId, isSuperadmin])

  const isOwner = Boolean(
    activeServer && user && activeServer.owner_id === user.id,
  )

  const isStaff = isOwner || isSuperadmin || role !== null

  const permissions: PermissionFlag[] = isSuperadmin || isOwner
    ? [
        "manage_bans",
        "manage_shifts",
        "manage_roles",
        "manage_appeals",
        "access_cad",
        "view_analytics",
        "view_audit_logs",
      ]
    : role
    ? [...new Set([...DEFAULT_PERMISSIONS, ...role.permissions])]
    : DEFAULT_PERMISSIONS

  const can = useCallback(
    (flag: PermissionFlag): boolean => {
      if (isSuperadmin || isOwner) return true
      return permissions.includes(flag)
    },
    [isSuperadmin, isOwner, permissions],
  )

  return {
    can,
    isOwner,
    isStaff,
    isSuperadmin,
    role,
    permissions,
    isLoading,
  }
}

// ─── Consumer hook ────────────────────────────────────────────────────────────

/**
 * Returns the resolved permissions for the current user in the active server.
 * Must be used inside PermissionsContext.Provider (set up in (protected)/layout.tsx).
 */
export function usePermissions(): PermissionsContextValue {
  return useContext(PermissionsContext)
}
