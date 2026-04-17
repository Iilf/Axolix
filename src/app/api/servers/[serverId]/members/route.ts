/**
 * src/app/api/servers/[serverId]/members/route.ts
 *
 * GET /api/servers/[serverId]/members — paginated member list
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, notFound, serverError } from "@/lib/auth/guard"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/constants"
import type { GetMembersResponse } from "@/types/api"

export const GET = withAuth<GetMembersResponse>(async (request, { params }) => {
  const { serverId } = await params
  const { searchParams } = request.nextUrl

  const search   = searchParams.get("search") ?? ""
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)))

  try {
    const supabase = await getSupabaseServerClient()

    // Verify the server exists and the user is a member (RLS enforces this)
    const { data: membership } = await supabase
      .from("server_members")
      .select("id")
      .eq("server_id", serverId)
      .limit(1)
      .single()

    if (!membership) return notFound("Server") as NextResponse<GetMembersResponse>

    let query = supabase
      .from("server_members")
      .select(
        `
        id, server_id, user_id, role_id, joined_at,
        user:users(id, discord_username, roblox_username, avatar_url),
        role:staff_roles(id, name, color, rank_order)
        `,
        { count: "exact" },
      )
      .eq("server_id", serverId)

    if (search) {
      query = query.or(
        `users.discord_username.ilike.%${search}%,users.roblox_username.ilike.%${search}%`,
      )
    }

    query = query
      .order("joined_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      data:     data ?? [],
      total:    count ?? 0,
      page,
      pageSize,
      hasMore:  (count ?? 0) > page * pageSize,
    })
  } catch (err) {
    console.error(`GET /api/servers/${serverId}/members error:`, err)
    return serverError() as NextResponse<GetMembersResponse>
  }
})
