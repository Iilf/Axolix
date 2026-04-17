/**
 * src/app/api/servers/[serverId]/shifts/route.ts
 *
 * GET  /api/servers/[serverId]/shifts — shift history, paginated
 * POST /api/servers/[serverId]/shifts — start a new shift
 *
 * One active shift globally enforced — a user cannot be on shift
 * in two servers simultaneously.
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, badRequest, serverError } from "@/lib/auth/guard"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/constants"
import { elapsedSeconds } from "@/lib/utils/format"
import type { GetShiftsResponse, StartShiftResponse } from "@/types/api"

// ─── GET /api/servers/[serverId]/shifts ───────────────────────────────────────

export const GET = withAuth<GetShiftsResponse>(async (request, { params }) => {
  const { serverId } = await params
  const { searchParams } = request.nextUrl

  const userId   = searchParams.get("userId")   ?? ""
  const active   = searchParams.get("active")   === "true"
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)))

  try {
    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from("shifts")
      .select(
        `
        id, server_id, user_id, started_at, ended_at, notes,
        user:users(id, discord_username, roblox_username, avatar_url)
        `,
        { count: "exact" },
      )
      .eq("server_id", serverId)

    if (userId) query = query.eq("user_id", userId)
    if (active) query = query.is("ended_at", null)

    query = query
      .order("started_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, count, error } = await query
    if (error) throw error

    const enriched = ((data ?? []) as any[]).map((shift) => ({
      ...shift,
      durationSeconds: shift.ended_at
        ? elapsedSeconds(shift.started_at, shift.ended_at)
        : null,
    }))

    return NextResponse.json({
      data:     enriched,
      total:    count ?? 0,
      page,
      pageSize,
      hasMore:  (count ?? 0) > page * pageSize,
    })
  } catch (err) {
    console.error(`GET /api/servers/${serverId}/shifts error:`, err)
    return serverError() as NextResponse<GetShiftsResponse>
  }
})

// ─── POST /api/servers/[serverId]/shifts ──────────────────────────────────────

export const POST = withAuth<StartShiftResponse>(async (_request, { params, user }) => {
  const { serverId } = await params

  try {
    const supabase = getSupabaseAdminClient()

    // Enforce one active shift globally — check ALL servers
    const { data: existing } = await supabase
      .from("shifts")
      .select("id, server_id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .limit(1)
      .single()

    if (existing) {
      return badRequest(
        existing.server_id === serverId
          ? "You already have an active shift in this server."
          : "You already have an active shift in another server. End it before starting a new one.",
      ) as NextResponse<StartShiftResponse>
    }

    const { data: shift, error } = await supabase
      .from("shifts")
      .insert({
        server_id:  serverId,
        user_id:    user.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !shift) throw error

    // Write audit log
    await supabase.from("audit_logs").insert({
      server_id: serverId,
      actor_id:  user.id,
      action:    "shift.start",
      target_id: shift.id,
      details:   { started_at: shift.started_at },
    })

    return NextResponse.json({ shift }, { status: 201 })
  } catch (err) {
    console.error(`POST /api/servers/${serverId}/shifts error:`, err)
    return serverError() as NextResponse<StartShiftResponse>
  }
})
