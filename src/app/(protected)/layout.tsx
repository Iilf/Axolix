/**
 * src/app/(protected)/layout.tsx
 *
 * Auth guard layout for all protected routes (/dashboard, /staff, /cad).
 *
 * Responsibilities:
 *   1. Server-side session check — redirects to /login if no valid session.
 *   2. Fetches the user's server list for the server switcher.
 *   3. Sets up ServerContext and PermissionsContext providers for all
 *      child routes to consume via useServer() and usePermissions().
 *   4. Renders the Navbar (which reads both contexts).
 *
 * This is a Server Component — session check happens before any HTML is sent.
 * The Provider wrapper is a thin Client Component that hydrates the contexts.
 */

import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ROUTES } from "@/lib/utils/constants"
import { ProtectedLayoutClient } from "./ProtectedLayoutClient"
import type { ServerRow } from "@/types/database"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── 1. Auth check ────────────────────────────────────────────────────────
  const user = await getSession()

  if (!user) {
    redirect(ROUTES.login)
  }

  // ── 2. Fetch user's server list ──────────────────────────────────────────
  // Used by the server switcher in the Navbar and the dashboard server card grid.
  // Fetched here once so every child route gets it SSR'd without an extra fetch.
  let userServers: ServerRow[] = []

  try {
    const supabase = await getSupabaseServerClient()

    const { data } = await supabase
      .from("server_members")
      .select("server_id, servers(*)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })

    userServers = (data ?? [])
      .map((row) => (row as { servers: ServerRow | null }).servers)
      .filter((s): s is ServerRow => s !== null)
  } catch {
    // Non-fatal — server list can be empty on first login or if DB is slow.
    // The dashboard will show an empty state rather than crashing.
  }

  // ── 3. Hand off to client wrapper ────────────────────────────────────────
  return (
    <ProtectedLayoutClient user={user} initialServers={userServers}>
      {children}
    </ProtectedLayoutClient>
  )
}
