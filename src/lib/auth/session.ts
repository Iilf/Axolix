/**
 * src/lib/auth/session.ts
 *
 * Cookie read/write helpers for the axolix_session JWT.
 * All session operations go through these functions — nothing writes cookies
 * directly to avoid inconsistent flag configurations.
 *
 * The session JWT is signed with SESSION_SECRET (HS256 via jose).
 * It is httpOnly, Secure, and SameSite=Strict — never readable by JS.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import type { SessionPayload, SessionUser } from "@/types/auth"
import {
  COOKIE_SESSION,
  COOKIE_SESSION_MAX_AGE,
  COOKIE_THEME,
  COOKIE_THEME_MAX_AGE,
  COOKIE_PREFS,
  COOKIE_PREFS_MAX_AGE,
  DEFAULT_THEME,
} from "@/lib/utils/constants"

// ─── Secret ───────────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set")
  return new TextEncoder().encode(secret)
}

// ─── JWT sign / verify ────────────────────────────────────────────────────────

/**
 * Signs a session payload into a JWT string.
 * Called after successful Discord OAuth — result is written to the cookie.
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

/**
 * Verifies and decodes a session JWT.
 * Returns null if the token is missing, expired, or tampered with.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ─── Server-side session reads ────────────────────────────────────────────────

/**
 * Reads and verifies the session cookie from the Next.js cookie store.
 * Use in Server Components and API route handlers.
 *
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_SESSION)?.value

  if (!token) return null

  const payload = await verifySession(token)
  if (!payload) return null

  return sessionPayloadToUser(payload)
}

/**
 * Reads the session from an incoming NextRequest (for use in middleware).
 * Does not use the Next.js cookies() API — safe to call at the edge.
 */
export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_SESSION)?.value
  if (!token) return null

  const payload = await verifySession(token)
  if (!payload) return null

  return sessionPayloadToUser(payload)
}

// ─── Cookie writers ───────────────────────────────────────────────────────────

/**
 * Sets the axolix_session cookie on a NextResponse.
 * Called by the Discord OAuth callback after a successful login.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_SESSION, token, {
    httpOnly:  true,
    secure:    true,
    sameSite:  "strict",
    maxAge:    COOKIE_SESSION_MAX_AGE,
    path:      "/",
  })
}

/**
 * Clears the axolix_session cookie on a NextResponse.
 * Called by /api/auth/logout.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_SESSION, "", {
    httpOnly:  true,
    secure:    true,
    sameSite:  "strict",
    maxAge:    0,
    path:      "/",
  })
}

/**
 * Reads the current theme from the axolix_theme cookie.
 * Falls back to "dark" if the cookie is missing or invalid.
 * Safe to call server-side.
 */
export async function getThemeCookie(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_THEME)?.value ?? DEFAULT_THEME
}

/**
 * Sets the axolix_theme cookie on a NextResponse.
 */
export function setThemeCookie(response: NextResponse, theme: string): void {
  response.cookies.set(COOKIE_THEME, theme, {
    secure:   true,
    sameSite: "lax",
    maxAge:   COOKIE_THEME_MAX_AGE,
    path:     "/",
  })
}

/**
 * Reads the user preferences from the axolix_prefs cookie.
 * Returns an empty object if missing or invalid JSON.
 */
export async function getPrefsCookie(): Promise<Record<string, unknown>> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_PREFS)?.value
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

/**
 * Sets the axolix_prefs cookie on a NextResponse.
 */
export function setPrefsCookie(
  response: NextResponse,
  prefs: Record<string, unknown>,
): void {
  response.cookies.set(COOKIE_PREFS, JSON.stringify(prefs), {
    secure:   true,
    sameSite: "lax",
    maxAge:   COOKIE_PREFS_MAX_AGE,
    path:     "/",
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sessionPayloadToUser(payload: SessionPayload): SessionUser {
  return {
    id:              payload.userId,
    discordId:       payload.discordId,
    discordUsername: payload.discordUsername,
    avatarUrl:       payload.avatarUrl,
    robloxId:        payload.robloxId,
    robloxUsername:  payload.robloxUsername,
    plan:            payload.plan,
    isSuperadmin:    payload.isSuperadmin,
    isRobloxLinked:  payload.robloxId !== null,
  }
}
