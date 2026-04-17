/**
 * src/lib/supabase/server.ts
 *
 * Server-side Supabase client — created fresh per request.
 * Import this in Server Components, API route handlers, and server actions.
 *
 * IMPORTANT: Never share this instance across requests. Each call to
 * getSupabaseServerClient() creates a new client bound to that request's
 * cookies. Sharing instances leaks session data between users.
 *
 * Uses the anon key + RLS for user-scoped queries.
 * Uses the service role key only for superadmin operations — see getSupabaseAdminClient().
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"
import { COOKIE_SESSION } from "@/lib/utils/constants"

/**
 * Per-request Supabase client that reads the session cookie.
 * RLS policies are enforced using the authenticated user's JWT.
 *
 * Usage in Server Components:
 *   const supabase = await getSupabaseServerClient()
 *   const { data } = await supabase.from("servers").select("*")
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: { [key: string]: unknown } }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — cookies cannot be set
            // from Server Components. This is safe to ignore; the middleware
            // handles session refresh separately.
          }
        },
      },
    },
  )
}

/**
 * Service-role Supabase client — bypasses RLS entirely.
 *
 * Use ONLY for:
 *   - Superadmin operations (impersonation, cross-server reads)
 *   - Server-side upserts during OAuth (creating the user row)
 *   - Background jobs that run outside user request context
 *
 * Never call this from client-side code or expose the service key to the browser.
 */
export function getSupabaseAdminClient() {
  // Import createClient directly — the admin client doesn't need cookie handling
  const { createClient } = require("@supabase/supabase-js")

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken:    false,
        persistSession:      false,
        detectSessionInUrl:  false,
      },
    },
  )
}
