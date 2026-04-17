"use client"

/**
 * src/components/SearchBar.tsx
 *
 * Standalone search input with results popover.
 * Entirely self-contained — no navbar coupling.
 * Used in: Navbar (context="global"), CommandPalette (context="global"),
 *          directory page (context="directory"), staff panel (context="staff").
 *
 * Props:
 *   context         — scopes which data is searched
 *   placeholder     — input placeholder text
 *   serverId        — required when context === "staff"
 *   onResultSelect  — called when the user clicks a result
 *   autoFocus       — focus the input on mount
 */

import { useRef, useEffect }       from "react"
import { useRouter }               from "next/navigation"
import { useSearch }               from "@/hooks/useSearch"
import { Avatar }                  from "@/components/Avatar"
import type { SearchContext, SearchResultItem } from "@/hooks/useSearch"

interface SearchBarProps {
  context:         SearchContext
  placeholder?:    string
  serverId?:       string
  onResultSelect?: (item: SearchResultItem) => void
  autoFocus?:      boolean
  className?:      string
}

export function SearchBar({
  context,
  placeholder = "Search…",
  serverId,
  onResultSelect,
  autoFocus,
  className,
}: SearchBarProps) {
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { query, setQuery, results, isLoading, isEmpty, clear } = useSearch({
    context,
    serverId,
  })

  const showPopover = query.length > 0

  // Auto-focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Click outside to clear
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        clear()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [clear])

  function handleSelect(item: SearchResultItem) {
    onResultSelect?.(item)
    if (!onResultSelect) {
      router.push(item.href)
    }
    clear()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { clear(); inputRef.current?.blur() }
  }

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Input */}
      <div
        style={{
          position:     "relative",
          display:      "flex",
          alignItems:   "center",
        }}
      >
        <span
          aria-hidden
          style={{
            position:   "absolute",
            left:       "var(--space-3)",
            color:      "var(--text-tertiary)",
            fontSize:   "14px",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPopover}
          aria-haspopup="listbox"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width:        "100%",
            padding:      "var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 20px)",
            background:   "var(--bg-muted)",
            border:       "1px solid var(--border-base)",
            borderRadius: "var(--radius-lg)",
            fontFamily:   "var(--font-ui)",
            fontSize:     "var(--text-sm)",
            color:        "var(--text-primary)",
            outline:      "none",
            transition:   "border-color var(--dur-fast) var(--ease-out)",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)" }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border-base)" }}
        />
        {isLoading && (
          <span
            aria-label="Searching…"
            style={{
              position:  "absolute",
              right:     "var(--space-3)",
              width:     12,
              height:    12,
              border:    "2px solid var(--border-strong)",
              borderTopColor: "var(--accent)",
              borderRadius:   "var(--radius-full)",
              animation: "axolix-spin 0.6s linear infinite",
            }}
          />
        )}
      </div>

      {/* Results popover */}
      {showPopover && (
        <div
          ref={popoverRef}
          role="listbox"
          aria-label="Search results"
          style={{
            position:     "absolute",
            top:          "calc(100% + var(--space-1))",
            left:         0,
            right:        0,
            zIndex:       "var(--z-dropdown)",
            background:   "var(--bg-elevated)",
            border:       "1px solid var(--border-base)",
            borderRadius: "var(--radius-xl)",
            overflow:     "hidden",
            boxShadow:    "0 8px 24px rgba(0,0,0,0.15)",
            animation:    "axolix-slide-up var(--dur-enter) var(--ease-spring)",
          }}
        >
          {isEmpty ? (
            <p style={{
              padding:    "var(--space-4) var(--space-4)",
              fontFamily: "var(--font-ui)",
              fontSize:   "var(--text-sm)",
              color:      "var(--text-tertiary)",
              textAlign:  "center",
            }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: "var(--space-1)" }}>
              {results.map((item) => (
                <ResultItem key={item.id} item={item} onSelect={handleSelect} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Result item ──────────────────────────────────────────────────────────────

function ResultItem({
  item,
  onSelect,
}: {
  item:     SearchResultItem
  onSelect: (item: SearchResultItem) => void
}) {
  const TYPE_LABEL: Record<string, string> = {
    server: "Server",
    user:   "User",
    ban:    "Ban",
    member: "Member",
    audit:  "Log",
  }

  return (
    <li
      role="option"
      aria-selected="false"
      onClick={() => onSelect(item)}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "var(--space-3)",
        padding:      "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-lg)",
        cursor:       "pointer",
        transition:   "background var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
    >
      <Avatar src={item.avatarUrl} username={item.title} size="sm" />

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display:      "block",
            fontFamily:   "var(--font-ui)",
            fontSize:     "var(--text-sm)",
            fontWeight:   500,
            color:        "var(--text-primary)",
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap",
          }}
        >
          {item.title}
        </span>
        {item.subtitle && (
          <span
            style={{
              display:      "block",
              fontFamily:   "var(--font-ui)",
              fontSize:     "var(--text-xs)",
              color:        "var(--text-tertiary)",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {item.subtitle}
          </span>
        )}
      </span>

      <span
        style={{
          fontFamily:  "var(--font-ui)",
          fontSize:    "var(--text-xs)",
          color:       "var(--text-tertiary)",
          flexShrink:  0,
        }}
      >
        {TYPE_LABEL[item.type] ?? item.type}
      </span>
    </li>
  )
}