/**
 * src/app/api/servers/[serverId]/bans/[banId]/route.ts
 *
 * PATCH /api/servers/[serverId]/bans/[banId] — update or lift a ban
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, notFound, serverError } from "@/lib/auth/guard"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import type { UpdateBanResponse, UpdateBanRequest } from "@/types/api"

export const PATCH = withAuth<UpdateBanResponse>(async (request, { params, user }) => {
  const { serverId, banId } = await params

  let body: UpdateBanRequest = {}
  try {
    body = await request.json()
  } catch { /* empty body ok */ }

  try {
    const supabase = getSupabaseAdminClient()

    const { data: existing } = await supabase
      .from("bans")
      .select("*")
      .eq("id", banId)
      .eq("server_id", serverId)
      .single()

    if (!existing) return notFound("Ban") as NextResponse<UpdateBanResponse>

    const updates: Record<string, unknown> = {}
    if (body.active      !== undefined) updates.active      = body.active
    if (body.reason      !== undefined) updates.reason      = body.reason
    if (body.evidenceUrl !== undefined) updates.evidence_url = body.evidenceUrl
    if (body.expiresAt   !== undefined) updates.expires_at  = body.expiresAt

    const { data: ban, error } = await (supabase.from("bans") as any)
      .update(updates)
      .eq("id", banId)
      .select()
      .single()

    if (error || !ban) throw error

    const wasLifted = existing.active === true && body.active === false

    await supabase.from("audit_logs").insert({
      server_id: serverId,
      actor_id:  user.id,
      action:    wasLifted ? "ban.lift" : "ban.update",
      target_id: banId,
      details:   { before: existing, after: updates },
    })

    return NextResponse.json({ ban })
  } catch (err) {
    console.error(`PATCH /api/servers/${serverId}/bans/${banId} error:`, err)
    return serverError() as NextResponse<UpdateBanResponse>
  }
})
