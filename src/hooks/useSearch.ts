"use client"

/**
 * src/hooks/useSearch.ts
 *
 * Federated search hook used by SearchBar and CommandPalette.
 * Manages debouncing, abort controllers (cancel in-flight requests on keystroke),
 * loading state, and result normalisation per context.
 *
 * SearchBar is purely presentational — it takes onSearch and results props.
 * This hook owns all the async logic.
 *
 * Context modes:
 *   "global"    — searches servers by name, users by username (Ctrl+K / Navbar)
 *   "directory" — searches servers table with full-text on name + description
 *   "staff"     — searches members, bans, audit_logs within server RLS scope
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { API, DEFAULT_PAGE_SIZE } from "@/lib/utils/constants"

export type SearchContext = "global" | "directory" | "staff"

export interface SearchResultItem {
  id:       string
  type:     "server" | "user" | "ban" | "member" | "audit"
  title:    string
  subtitle: string | null
  avatarUrl: string | null
  href:     string
}

interface UseSearchOptions {
  context:    SearchContext
  serverId?:  string   // required when context === "staff"
  debounceMs?: number  // default 300
}

interface UseSearchReturn {
  query:     string
  setQuery:  (q: string) => void
  results:   SearchResultItem[]
  isLoading: boolean
  isEmpty:   boolean  // query is non-empty but results are empty
  clear:     () => void
}

export function useSearch({
  context,
  serverId,
  debounceMs = 300,
}: UseSearchOptions): UseSearchReturn {
  const [query,     setQueryState] = useState("")
  const [results,   setResults]    = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading]  = useState(false)

  // Track the abort controller for the most recent in-flight request
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(
    async (q: string) => {
      // Cancel any previous in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)

      try {
        const items = await fetchResults(q, context, controller.signal, serverId)
        // Only update if this request wasn't superseded
        if (!controller.signal.aborted) {
          setResults(items)
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [context, serverId],
  )

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q)

      // Clear the debounce timer on every keystroke
      if (timerRef.current) clearTimeout(timerRef.current)

      if (!q.trim()) {
        // Empty query — clear immediately, no request needed
        abortRef.current?.abort()
        setResults([])
        setIsLoading(false)
        return
      }

      timerRef.current = setTimeout(() => {
        runSearch(q.trim())
      }, debounceMs)
    },
    [runSearch, debounceMs],
  )

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    abortRef.current?.abort()
    setQueryState("")
    setResults([])
    setIsLoading(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  return {
    query,
    setQuery,
    results,
    isLoading,
    isEmpty: query.trim().length > 0 && !isLoading && results.length === 0,
    clear,
  }
}

// ─── Fetch logic ──────────────────────────────────────────────────────────────

async function fetchResults(
  query:    string,
  context:  SearchContext,
  signal:   AbortSignal,
  serverId?: string,
): Promise<SearchResultItem[]> {
  const params = new URLSearchParams({ search: query, pageSize: "6" })

  switch (context) {
    case "directory": {
      const res = await fetch(`${API.servers}?${params}`, { signal })
      if (!res.ok) return []
      const json = await res.json()
      return (json.data ?? []).map(normaliseServer)
    }

    case "global": {
      // Parallel: servers + users
      const [serversRes, usersRes] = await Promise.allSettled([
        fetch(`${API.servers}?${params}`, { signal }),
        fetch(`/api/users?${params}`, { signal }),
      ])

      const servers = serversRes.status === "fulfilled" && serversRes.value.ok
        ? ((await serversRes.value.json()).data ?? []).map(normaliseServer)
        : []

      const users = usersRes.status === "fulfilled" && usersRes.value.ok
        ? ((await usersRes.value.json()).data ?? []).map(normaliseUser)
        : []

      // Interleave: server, user, server, user…
      const combined: SearchResultItem[] = []
      const max = Math.max(servers.length, users.length)
      for (let i = 0; i < max; i++) {
        if (servers[i]) combined.push(servers[i])
        if (users[i])   combined.push(users[i])
      }
      return combined.slice(0, 8)
    }

    case "staff": {
      if (!serverId) return []

      // Parallel: members + bans
      const [membersRes, bansRes] = await Promise.allSettled([
        fetch(`${API.members(serverId)}?${params}`, { signal }),
        fetch(`${API.bans(serverId)}?${params}`, { signal }),
      ])

      const members = membersRes.status === "fulfilled" && membersRes.value.ok
        ? ((await membersRes.value.json()).data ?? []).map(normaliseMember)
        : []

      const bans = bansRes.status === "fulfilled" && bansRes.value.ok
        ? ((await bansRes.value.json()).data ?? []).map(normaliseBan)
        : []

      return [...members, ...bans].slice(0, 8)
    }
  }
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normaliseServer(s: Record<string, unknown>): SearchResultItem {
  return {
    id:       s.id as string,
    type:     "server",
    title:    s.name as string,
    subtitle: s.description as string | null,
    avatarUrl: s.icon_url as string | null,
    href:     `/directory/${s.id}`,
  }
}

function normaliseUser(u: Record<string, unknown>): SearchResultItem {
  return {
    id:       u.id as string,
    type:     "user",
    title:    (u.discord_username ?? u.roblox_username ?? "Unknown") as string,
    subtitle: u.roblox_username ? `Roblox: ${u.roblox_username}` : null,
    avatarUrl: u.avatar_url as string | null,
    href:     `/users/${u.id}`,
  }
}

function normaliseMember(m: Record<string, unknown>): SearchResultItem {
  const user = m.user as Record<string, unknown> | undefined
  return {
    id:       m.id as string,
    type:     "member",
    title:    (user?.discord_username ?? "Unknown") as string,
    subtitle: (user?.roblox_username as string | null) ?? null,
    avatarUrl: (user?.avatar_url as string | null) ?? null,
    href:     "#",
  }
}

function normaliseBan(b: Record<string, unknown>): SearchResultItem {
  return {
    id:       b.id as string,
    type:     "ban",
    title:    (b.target_username ?? b.target_roblox_id) as string,
    subtitle: (b.reason as string | null) ?? null,
    avatarUrl: null,
    href:     "#",
  }
}
