/**
 * src/app/api/auth/roblox/redirect/route.ts
 *
 * GET /api/auth/roblox/redirect
 * Builds the Roblox OAuth URL and redirects the browser to it.
 * User must already be authenticated with Discord before hitting this.
 */

import { redirect } from "next/navigation"
import { type NextRequest } from "next/server"
import { buildRobloxAuthUrl } from "@/lib/auth/providers"
import { requireAuth } from "@/lib/auth/guard"
import { ROUTES } from "@/lib/utils/constants"

export async function GET(request: NextRequest) {
  // Must be logged in with Discord first
  await requireAuth()

  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? ROUTES.dashboard
  const url = await buildRobloxAuthUrl(redirectTo)
  redirect(url)
}
