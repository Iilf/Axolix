/**
 * src/app/api/servers/[serverId]/bans/route.ts
 *
 * GET  /api/servers/[serverId]/bans — paginated ban list
 * POST /api/servers/[serverId]/bans — create a ban (syncs to ERLC API)
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, badRequest, serverError } from "@/lib/auth/guard"
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server"
import { DEFAULT_PAGE_SIZE } from "@/lib/utils/constants"
import type { GetBansResponse, CreateBanResponse, CreateBanRequest } from "@/types/api"

// ─── GET /api/servers/[serverId]/bans ────────────────────────────────────────

export const GET = withAuth<GetBansResponse>(async (request, { params }) => {
  const { serverId } = await params
  const { searchParams } = request.nextUrl

  const search   = searchParams.get("search")  ?? ""
  const active   = searchParams.get("active")
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)))

  try {
    const supabase = await getSupabaseServerClient()

    let query = supabase
      .from("bans")
      .select(
        `
        id, server_id, target_roblox_id, target_username, reason,
        evidence_url, issued_by, issued_at, expires_at, active,
        synced, sync_error,
        issuedByUser:users(id, discord_username, avatar_url)
        `,
        { count: "exact" },
      )
      .eq("server_id", serverId)

    if (search) {
      query = query.or(
        `target_username.ilike.%${search}%,target_roblox_id.ilike.%${search}%`,
      )
    }

    if (active === "true")  query = query.eq("active", true)
    if (active === "false") query = query.eq("active", false)

    query = query
      .order("issued_at", { ascending: false })
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
    console.error(`GET /api/servers/${serverId}/bans error:`, err)
    return serverError() as NextResponse<GetBansResponse>
  }
})

// ─── POST /api/servers/[serverId]/bans ───────────────────────────────────────

export const POST = withAuth<CreateBanResponse>(async (request, { params, user }) => {
  const { serverId } = await params

  let body: CreateBanRequest
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON body") as NextResponse<CreateBanResponse>
  }

  if (!body.targetRobloxId) {
    return badRequest("targetRobloxId is required") as NextResponse<CreateBanResponse>
  }

  try {
    const supabase = getSupabaseAdminClient()

    // Write ban to Supabase first — then attempt ERLC sync
    const { data: ban, error: dbError } = await supabase
      .from("bans")
      .insert({
        server_id:        serverId,
        target_roblox_id: body.targetRobloxId,
        target_username:  body.targetUsername  ?? null,
        reason:           body.reason          ?? null,
        evidence_url:     body.evidenceUrl     ?? null,
        issued_by:        user.id,
        expires_at:       body.expiresAt       ?? null,
        active:           true,
        synced:           false,  // will be updated after ERLC sync attempt
        sync_error:       null,
      })
      .select()
      .single()

    if (dbError || !ban) throw dbError

    // Attempt ERLC API sync — non-fatal if it fails
    let synced     = false
    let syncError: string | null = null

    try {
      // TODO: call ERLC API to push the ban
      // const erlcRes = await pushErlcBan(serverId, ban)
      // synced = erlcRes.ok
      // For now, mark as unsynced — Oracle poller will retry
      synced = false
    } catch (erlcErr) {
      syncError = erlcErr instanceof Error ? erlcErr.message : "Unknown ERLC sync error"
    }

    // Update sync status
    await supabase
      .from("bans")
      .update({ synced, sync_error: syncError })
      .eq("id", ban.id)

    // Audit log
    await supabase.from("audit_logs").insert({
      server_id: serverId,
      actor_id:  user.id,
      action:    "ban.create",
      target_id: ban.id,
      details:   {
        target_roblox_id: ban.target_roblox_id,
        target_username:  ban.target_username,
        reason:           ban.reason,
        expires_at:       ban.expires_at,
      },
    })

    return NextResponse.json({ ban: { ...ban, synced, sync_error: syncError }, synced }, { status: 201 })
  } catch (err) {
    console.error(`POST /api/servers/${serverId}/bans error:`, err)
    return serverError() as NextResponse<CreateBanResponse>
  }
})
