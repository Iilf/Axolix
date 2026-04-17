/**
 * src/app/api/servers/route.ts
 *
 * GET  /api/servers — public server directory list with search + filters
 * POST /api/servers — connect a Discord guild as an Axolix server
 */

import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"
import { withAuth, badRequest, serverError } from "@/lib/auth/guard"
import { getDiscordGuild, buildGuildIconUrl } from "@/lib/api/discord"
import { DIRECTORY_MIN_MEMBERS, DEFAULT_PAGE_SIZE } from "@/lib/utils/constants"
import type { GetServersResponse, CreateServerResponse } from "@/types/api"

// ─── GET /api/servers ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const search        = searchParams.get("search")        ?? ""
  const region        = searchParams.get("region")        ?? ""
  const rpStyle       = searchParams.get("rpStyle")       ?? ""
  const activityLevel = searchParams.get("activityLevel") ?? ""
  const page          = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const pageSize      = Math.min(100, Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)))
  const sort          = searchParams.get("sort") ?? "member_count"

  try {
    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from("servers")
      .select("*", { count: "exact" })
      .eq("listed", true)
      .gte("member_count", DIRECTORY_MIN_MEMBERS)

    // Full-text search on name and description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (region)        query = query.eq("region", region)
    if (rpStyle)       query = query.eq("rp_style", rpStyle)
    if (activityLevel) query = query.eq("activity_level", activityLevel)

    // Featured servers always float to the top, then sort by chosen field
    const sortColumn = ["member_count", "activity_level", "created_at"].includes(sort)
      ? sort
      : "member_count"

    query = query
      .order("featured",    { ascending: false })
      .order(sortColumn,    { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, count, error } = await query

    if (error) throw error

    const response: GetServersResponse = {
      data:     data ?? [],
      total:    count ?? 0,
      page,
      pageSize,
      hasMore:  (count ?? 0) > page * pageSize,
    }

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    })
  } catch (err) {
    console.error("GET /api/servers error:", err)
    return serverError()
  }
}

// ─── POST /api/servers ────────────────────────────────────────────────────────

export const POST = withAuth<CreateServerResponse>(async (request, { user }) => {
  let body: { discordGuildId?: string }
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON body") as NextResponse<CreateServerResponse>
  }

  const { discordGuildId } = body
  if (!discordGuildId) {
    return badRequest("discordGuildId is required") as NextResponse<CreateServerResponse>
  }

  try {
    // Verify the guild exists and the user is the owner
    const guild = await getDiscordGuild(discordGuildId)

    if (guild.owner_id !== user.discordId) {
      return NextResponse.json(
        { error: "You must be the owner of this Discord server", code: "NOT_OWNER", status: 403 },
        { status: 403 },
      ) as NextResponse<CreateServerResponse>
    }

    const iconUrl = buildGuildIconUrl(guild.id, guild.icon ?? null, 128)

    const supabase = getSupabaseAdminClient()

    // Upsert — idempotent if the server is already connected
    const { data: server, error: dbError } = await supabase
      .from("servers")
      .upsert(
        {
          discord_guild_id: discordGuildId,
          owner_id:         user.id,
          name:             guild.name,
          icon_url:         iconUrl,
          settings:         {},
        },
        { onConflict: "discord_guild_id" },
      )
      .select()
      .single()

    if (dbError || !server) {
      console.error("Server upsert failed:", dbError)
      return serverError() as NextResponse<CreateServerResponse>
    }

    // Add the owner as a server member
    await supabase
      .from("server_members")
      .upsert(
        { server_id: server.id, user_id: user.id },
        { onConflict: "server_id,user_id" },
      )

    return NextResponse.json({ server }, { status: 201 })
  } catch (err) {
    console.error("POST /api/servers error:", err)
    return serverError() as NextResponse<CreateServerResponse>
  }
})
