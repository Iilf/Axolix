/**
 * src/app/api/auth/roblox/callback/route.ts
 *
 * GET /api/auth/roblox/callback
 * Handles the Roblox OAuth callback:
 *   1. Validates the CSRF state
 *   2. Exchanges the code for a Roblox access token
 *   3. Fetches the Roblox user profile
 *   4. Links roblox_id + roblox_username to the user row
 *   5. Re-signs the session JWT with the updated Roblox data
 *   6. Redirects to the intended destination
 */

import { NextRequest, NextResponse } from "next/server"
import { validateOAuthState, exchangeRobloxCode, fetchRobloxProfile } from "@/lib/auth/providers"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getSession, signSession, setSessionCookie } from "@/lib/auth/session"
import { ROUTES } from "@/lib/utils/constants"
import type { SessionPayload } from "@/types/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code  = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code || !state) {
    return NextResponse.redirect(new URL(`${ROUTES.verify}?error=oauth_denied`, request.url))
  }

  // Must have an active session to link a Roblox account
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url))
  }

  const oauthState = await validateOAuthState("roblox", state)
  if (!oauthState) {
    return NextResponse.redirect(new URL(`${ROUTES.verify}?error=invalid_state`, request.url))
  }

  try {
    const tokens  = await exchangeRobloxCode(code)
    const profile = await fetchRobloxProfile(tokens.access_token)

    // Link Roblox account to the user row
    // Note: roblox_id is NOT unique — multiple Discord accounts can share one Roblox ID
    const supabase = getSupabaseAdminClient()
    const { data: user, error: dbError } = await supabase
      .from("users")
      .update({
        roblox_id:       profile.sub,
        roblox_username: profile.preferred_username,
      })
      .eq("id", session.id)
      .select()
      .single()

    if (dbError || !user) {
      console.error("Roblox link failed:", dbError)
      return NextResponse.redirect(new URL(`${ROUTES.verify}?error=db_error`, request.url))
    }

    // Re-sign the session with updated Roblox data so isRobloxLinked reflects immediately
    const payload: SessionPayload = {
      userId:          user.id,
      discordId:       user.discord_id,
      discordUsername: user.discord_username ?? session.discordUsername,
      avatarUrl:       user.avatar_url,
      robloxId:        user.roblox_id,
      robloxUsername:  user.roblox_username,
      plan:            user.plan,
      isSuperadmin:    user.is_superadmin,
      issuedAt:        new Date().toISOString(),
      expiresAt:       new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const token    = await signSession(payload)
    const response = NextResponse.redirect(
      new URL(oauthState.redirectTo ?? ROUTES.dashboard, request.url),
    )

    setSessionCookie(response, token)
    return response
  } catch (err) {
    console.error("Roblox callback error:", err)
    return NextResponse.redirect(new URL(`${ROUTES.verify}?error=server_error`, request.url))
  }
}
