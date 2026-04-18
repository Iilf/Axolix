/**
 * src/app/api/servers/[serverId]/shifts/[shiftId]/route.ts
 *
 * PATCH /api/servers/[serverId]/shifts/[shiftId] — end a shift
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, notFound, forbidden, badRequest, serverError } from "@/lib/auth/guard"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { elapsedSeconds } from "@/lib/utils/format"
import type { EndShiftResponse } from "@/types/api"

export const PATCH = withAuth<EndShiftResponse>(async (request, { params, user }) => {
  const { serverId, shiftId } = await params

  let body: { notes?: string } = {}
  try {
    body = await request.json()
  } catch { /* no body is fine */ }

  try {
    const supabase = getSupabaseAdminClient()

    const { data: shift } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", shiftId)
      .eq("server_id", serverId)
      .single()

    if (!shift) return notFound("Shift") as NextResponse<EndShiftResponse>

    // Only the shift owner or a server admin can end a shift
    const isOwner = shift.user_id === user.id
    if (!isOwner && !user.isSuperadmin) {
      return forbidden("You can only end your own shift") as NextResponse<EndShiftResponse>
    }

    if (shift.ended_at) {
      return badRequest("This shift has already ended") as NextResponse<EndShiftResponse>
    }

    const endedAt = new Date().toISOString()
    const duration = elapsedSeconds(shift.started_at, endedAt)

    const { data: updated, error } = await (supabase.from("shifts") as any)
      .update({ ended_at: endedAt, notes: body.notes ?? shift.notes })
      .eq("id", shiftId)
      .select()
      .single()

    if (error || !updated) throw error

    await supabase.from("audit_logs").insert({
      server_id: serverId,
      actor_id:  user.id,
      action:    "shift.end",
      target_id: shiftId,
      details:   { ended_at: endedAt, duration_seconds: duration, ended_by_admin: !isOwner },
    })

    return NextResponse.json({ shift: updated })
  } catch (err) {
    console.error(`PATCH /api/servers/${serverId}/shifts/${shiftId} error:`, err)
    return serverError() as NextResponse<EndShiftResponse>
  }
})
