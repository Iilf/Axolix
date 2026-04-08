import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSION, COOKIE_THEME, ROUTES } from "@/lib/utils/constants";

/**
 * Routes that require an authenticated session.
 * Any path starting with these prefixes will be guarded.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/staff", "/cad"];

/**
 * Routes that authenticated users should not see.
 * Logged-in users hitting /login are bounced to /dashboard.
 */
const AUTH_ONLY_ROUTES = ["/login", "/verify"];

/**
 * API routes that handle auth themselves — skip middleware for these.
 * The callback routes set the cookie; guarding them would break the flow.
 */
const AUTH_API_PREFIXES = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Never guard auth API routes — they establish the session
  if (AUTH_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_SESSION);
  const hasSession = Boolean(session?.value);

  // Redirect authenticated users away from login/verify
  if (hasSession && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  // Guard protected routes — redirect to login with the intended destination
  if (
    !hasSession &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Ensure the theme cookie is always set so the inline head script has a value.
  // This runs on every request — if the cookie exists, it's a no-op.
  const response = NextResponse.next();
  if (!request.cookies.has(COOKIE_THEME)) {
    response.cookies.set(COOKIE_THEME, "dark", {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  // Run middleware on all routes except Next.js internals and static files.
  // The matcher below is intentionally broad — the pathname checks above handle
  // the per-route logic cleanly.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};