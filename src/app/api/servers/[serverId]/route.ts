/**
 * src/app/api/servers/[serverId]/route.ts
 *
 * GET /api/servers/[serverId] — server detail with review summary
 */

import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound, serverError } from "@/lib/auth/guard"
import type { GetServerResponse } from "@/types/api"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  const { serverId } = await params

  try {
    const supabase = await getSupabaseServerClient()

    // Get server data
    const { data: serverData, error: serverError } = await supabase
      .from("servers")
      .select("*")
      .eq("id", serverId)
      .single()

    if (serverError || !serverData) {
      return notFound("Server")
    }

    // Get reviews data
    const { data: reviewsData } = await supabase
      .from("server_reviews")
      .select("rating")
      .eq("server_id", serverId)

    const reviews = reviewsData ?? [] as Array<{ rating: number }>
    const total   = reviews.length
    const average = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0

    const response: GetServerResponse = {
      server: serverData,
      reviews: {
        averageRating: Math.round(average * 10) / 10,
        totalReviews:  total,
      },
    }

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    })
  } catch (err) {
    console.error(`GET /api/servers/${serverId} error:`, err)
    return serverError()
  }
}
