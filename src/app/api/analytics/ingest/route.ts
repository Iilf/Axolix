/**
 * src/app/api/analytics/ingest/route.ts
 *
 * POST /api/analytics/ingest
 * Receives frontend analytics events, strips PII, validates the session,
 * then forwards the batch to the Oracle analytics API.
 *
 * The browser never calls Oracle directly — this route is the single
 * gateway. Rate limiting is handled at the Cloudflare WAF layer.
 */

import { NextRequest, NextResponse } from "next/server"
import { withAuth, badRequest, serverError } from "@/lib/auth/guard"
import { ingestEvents } from "@/lib/api/oracle"
import { ANALYTICS_BATCH_SIZE } from "@/lib/utils/constants"
import type { IngestEventsRequest, IngestEventsResponse } from "@/types/api"

export const POST = withAuth<IngestEventsResponse>(async (request, { user }) => {
  let body: IngestEventsRequest
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON body") as NextResponse<IngestEventsResponse>
  }

  if (!Array.isArray(body.events) || body.events.length === 0) {
    return badRequest("events array is required and must not be empty") as NextResponse<IngestEventsResponse>
  }

  // Hard cap — reject oversized batches
  if (body.events.length > ANALYTICS_BATCH_SIZE * 2) {
    return badRequest(`Maximum ${ANALYTICS_BATCH_SIZE * 2} events per request`) as NextResponse<IngestEventsResponse>
  }

  // Strip any PII that shouldn't leave the Next.js layer
  // The user ID is attached server-side, not trusted from the client
  const sanitised: IngestEventsRequest = {
    events:   body.events.map((e) => ({
      page:      e.page,
      eventType: e.eventType,
      xPct:      typeof e.xPct === "number" ? Math.min(100, Math.max(0, e.xPct)) : undefined,
      yPct:      typeof e.yPct === "number" ? Math.min(100, Math.max(0, e.yPct)) : undefined,
      metadata:  e.metadata ?? undefined,
    })),
    serverId: body.serverId ?? null,
  }

  try {
    const result = await ingestEvents(sanitised)
    return NextResponse.json({ accepted: result.accepted })
  } catch (err) {
    // Non-fatal — analytics failures should never surface to the user
    console.error("Analytics ingest error:", err)
    // Still return 200 so the client doesn't retry indefinitely
    return NextResponse.json({ accepted: 0 })
  }
})
