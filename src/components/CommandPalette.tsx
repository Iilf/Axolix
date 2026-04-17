"use client"

/**
 * src/components/CommandPalette.tsx
 *
 * Ctrl+K command palette. Wraps SearchBar with context="global"
 * in a wider full-screen modal with keyboard navigation.
 *
 * Mounted once in the protected layout — listens globally for Ctrl+K.
 */

import { useEffect, useState }  from "react"
import { useRouter }            from "next/navigation"
import { SearchBar }            from "@/components/SearchBar"
import { Modal }                from "@/components/modals/modal"
import type { SearchResultItem } from "@/hooks/useSearch"

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const router              = useRouter()

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  function handleSelect(item: SearchResultItem) {
    router.push(item.href)
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="md"
      title="Command palette"
    >
      <div style={{ padding: "var(--space-4)" }}>
        <SearchBar
          context="global"
          placeholder="Search servers, users, bans…"
          onResultSelect={handleSelect}
          autoFocus
        />

        {/* Keyboard hints */}
        <p
          style={{
            marginTop:  "var(--space-3)",
            fontFamily: "var(--font-ui)",
            fontSize:   "var(--text-xs)",
            color:      "var(--text-tertiary)",
            display:    "flex",
            gap:        "var(--space-3)",
          }}
        >
          <span><kbd style={kbdStyle} title="Enter key">↵</kbd> select</span>
          <span><kbd style={kbdStyle} title="Escape key">Esc</kbd> close</span>
          <span><kbd style={kbdStyle} title="Command or Control + K">⌘K</kbd> toggle</span>
        </p>
      </div>
    </Modal>
  )
}

const kbdStyle: React.CSSProperties = {
  display:      "inline-flex",
  alignItems:   "center",
  padding:      "1px 5px",
  borderRadius: "var(--radius-sm)",
  background:   "var(--bg-muted)",
  border:       "1px solid var(--border-base)",
  fontFamily:   "var(--font-mono)",
  fontSize:     "var(--text-xs)",
  color:        "var(--text-secondary)",
  lineHeight:   1.6,
}