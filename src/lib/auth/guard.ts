/**
 * src/lib/auth/guard.ts
 *
 * Auth guard utilities for Server Components and API route handlers.
 *
 * - requireAuth()    — throws/redirects if no valid session. Use in Server Components.
 * - withAuth()       — wraps an API route handler, injects the session user.
 * - requireRoblox()  — additional gate: user must have a linked Roblox account.
 * - requireAdmin()   — requires superadmin flag.
 */

import { redirect } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { ROUTES } from "@/lib/utils/constants"
import type { SessionUser } from "@/types/auth"

// ─── Server Component guard ───────────────────────────────────────────────────

/**
 * Retrieves the current session user in a Server Component.
 * Redirects to /login if no valid session exists.
 *
 * Usage:
 *   const user = await requireAuth()
 *
 * Optionally pass a redirectTo override for the post-login redirect.
 */
export async function requireAuth(redirectTo?: string): Promise<SessionUser> {
  const user = await getSession()

  if (!user) {
    const loginUrl = redirectTo
      ? `${ROUTES.login}?redirect=${encodeURIComponent(redirectTo)}`
      : ROUTES.login
    redirect(loginUrl)
  }

  return user
}

/**
 * Like requireAuth() but also requires a linked Roblox account.
 * Redirects to /verify if the user hasn't linked Roblox yet.
 * Used to gate the staff panel and CAD panel.
 */
export async function requireRoblox(redirectTo?: string): Promise<SessionUser> {
  const user = await requireAuth(redirectTo)

  if (!user.isRobloxLinked) {
    const verifyUrl = redirectTo
      ? `${ROUTES.verify}?redirect=${encodeURIComponent(redirectTo)}`
      : ROUTES.verify
    redirect(verifyUrl)
  }

  return user
}

/**
 * Requires superadmin flag. Redirects to dashboard if not a superadmin.
 * Used for internal ops views.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()

  if (!user.isSuperadmin) {
    redirect(ROUTES.dashboard)
  }

  return user
}

// ─── API route handler wrapper ────────────────────────────────────────────────

type ApiHandler<T = void> = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>>; user: SessionUser },
) => Promise<NextResponse<T>>

type ApiHandlerNoAuth<T = void> = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse<T>>

/**
 * Wraps an API route handler with session validation.
 * Returns 401 if no valid session. Injects the session user into context.
 *
 * Usage in a route handler:
 *   export const GET = withAuth(async (req, { user, params }) => {
 *     // user is guaranteed to be a SessionUser here
 *     return NextResponse.json({ userId: user.id })
 *   })
 */
export function withAuth<T>(handler: ApiHandler<T>): ApiHandlerNoAuth<T> {
  return async (request, context) => {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorised", code: "UNAUTHORISED", status: 401 },
        { status: 401 },
      ) as NextResponse<T>
    }

    return handler(request, { ...context, user })
  }
}

/**
 * Like withAuth() but also requires a linked Roblox account.
 * Returns 403 with ROBLOX_REQUIRED if the user hasn't linked.
 */
export function withRoblox<T>(handler: ApiHandler<T>): ApiHandlerNoAuth<T> {
  return async (request, context) => {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorised", code: "UNAUTHORISED", status: 401 },
        { status: 401 },
      ) as NextResponse<T>
    }

    if (!user.isRobloxLinked) {
      return NextResponse.json(
        { error: "Roblox account must be linked to access this resource", code: "ROBLOX_REQUIRED", status: 403 },
        { status: 403 },
      ) as NextResponse<T>
    }

    return handler(request, { ...context, user })
  }
}

/**
 * Wraps an API route handler and requires superadmin.
 * Returns 403 if the user is not a superadmin.
 */
export function withAdmin<T>(handler: ApiHandler<T>): ApiHandlerNoAuth<T> {
  return async (request, context) => {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorised", code: "UNAUTHORISED", status: 401 },
        { status: 401 },
      ) as NextResponse<T>
    }

    if (!user.isSuperadmin) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN", status: 403 },
        { status: 403 },
      ) as NextResponse<T>
    }

    return handler(request, { ...context, user })
  }
}

// ─── Shared error responses ───────────────────────────────────────────────────

export function unauthorised(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorised", code: "UNAUTHORISED", status: 401 },
    { status: 401 },
  )
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json(
    { error: message, code: "FORBIDDEN", status: 403 },
    { status: 403 },
  )
}

export function notFound(resource = "Resource"): NextResponse {
  return NextResponse.json(
    { error: `${resource} not found`, code: "NOT_FOUND", status: 404 },
    { status: 404 },
  )
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json(
    { error: message, code: "BAD_REQUEST", status: 400 },
    { status: 400 },
  )
}

export function serverError(message = "Internal server error"): NextResponse {
  return NextResponse.json(
    { error: message, code: "SERVER_ERROR", status: 500 },
    { status: 500 },
  )
}
