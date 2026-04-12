/**
 * src/lib/supabase/client.ts
 *
 * Browser-side Supabase client — singleton pattern.
 * Import this in React Client Components and hooks.
 *
 * Uses @supabase/ssr's createBrowserClient so session cookies are
 * handled automatically — no manual token management required.
 *
 * Never import this in Server Components or API route handlers.
 * Use src/lib/supabase/server.ts for server-side usage.
 */

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Returns a singleton Supabase client for browser use.
 * Calling this multiple times returns the same instance.
 */
export function getSupabaseBrowserClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}
