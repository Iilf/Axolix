/**
 * src/lib/supabase/middleware.ts
 *
 * Session refresh helper used by the Next.js edge middleware (middleware.ts).
 * Ensures the Supabase session cookie is kept fresh on every request without
 * requiring the user to re-login.
 *
 * This runs at the edge — keep it lean. No heavy imports.
 */

import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/database"

/**
 * Refreshes the Supabase session if it is close to expiry.
 * Mutates the response headers to set updated cookies.
 *
 * Call this from middleware.ts before any auth checks.
 * Returns the (potentially mutated) response.
 */
export async function refreshSupabaseSession(
  request:  NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: { [key: string]: unknown } }>) {
          // Write updated cookies to both the request and response so that
          // the refreshed session is available within this request cycle.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  // Calling getUser() triggers a silent token refresh if needed.
  // We don't use the result here — the middleware.ts auth check reads the
  // axolix_session cookie directly.
  await supabase.auth.getUser()

  return response
}
