/**
 * src/app/api/roblox/user/[robloxId]/route.ts
 *
 * GET /api/roblox/user/[robloxId]
 * Proxied Roblox user lookup — called from the client to avoid CORS.
 * The Roblox API does not allow direct browser requests.
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, notFound, serverError } from "@/lib/auth/guard"
import { getRobloxUser } from "@/lib/api/roblox"
import type { RobloxUserResponse } from "@/types/api"

export const GET = withAuth<RobloxUserResponse>(async (_request, { params }) => {
  const { robloxId } = await params

  try {
    const user = await getRobloxUser(robloxId)
    return NextResponse.json(user, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message.includes("not found") || message.includes("404")) {
      return notFound("Roblox user") as NextResponse<RobloxUserResponse>
    }
    console.error(`GET /api/roblox/user/${robloxId} error:`, err)
    return serverError() as NextResponse<RobloxUserResponse>
  }
})
