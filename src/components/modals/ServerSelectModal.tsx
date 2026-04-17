"use client"

/**
 * src/components/modals/ServerSelectModal.tsx
 *
 * Server switcher modal — lists the user's servers with search.
 * Selecting a server updates the useServer context (navigates to /dashboard/[id]).
 * Used in the Navbar avatar dropdown.
 */

import { useState }      from "react"
import Image             from "next/image"
import { Modal, ModalHeader, ModalBody } from "@/components/modals/modal"
import { useServer }     from "@/hooks/useServer"
import type { ServerRow } from "@/types/database"

interface ServerSelectModalProps {
  isOpen:  boolean
  onClose: () => void
}

export function ServerSelectModal({ isOpen, onClose }: ServerSelectModalProps) {
  const { userServers, activeServerId, switchServer } = useServer()
  const [search, setSearch] = useState("")

  const filtered = userServers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )

  function handleSelect(server: ServerRow) {
    switchServer(server.id)
    onClose()
    setSearch("")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Switch server">
      <ModalHeader onClose={onClose}>Switch server</ModalHeader>

      <ModalBody className="">
        {/* Search input */}
        <input
          type="search"
          placeholder="Search servers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          style={{
            width:        "100%",
            padding:      "var(--space-2) var(--space-3)",
            marginBottom: "var(--space-3)",
            background:   "var(--bg-muted)",
            border:       "1px solid var(--border-base)",
            borderRadius: "var(--radius-lg)",
            fontFamily:   "var(--font-ui)",
            fontSize:     "var(--text-sm)",
            color:        "var(--text-primary)",
            outline:      "none",
          }}
        />

        {/* Server list */}
        <div
          role="listbox"
          aria-label="Your servers"
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}
        >
          {filtered.length === 0 ? (
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)", textAlign: "center", padding: "var(--space-6)" }}>
              No servers found.
            </p>
          ) : (
            filtered.map((server) => {
              const isActive = server.id === activeServerId
              return (
                <button
                  key={server.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(server)}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "var(--space-3)",
                    width:        "100%",
                    padding:      "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-lg)",
                    border:       isActive ? "1px solid var(--accent)" : "1px solid transparent",
                    background:   isActive ? "var(--accent-dim)" : "transparent",
                    cursor:       "pointer",
                    textAlign:    "left",
                    transition:   "background var(--dur-fast) var(--ease-out)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{
                      width:        32,
                      height:       32,
                      borderRadius: "var(--radius-lg)",
                      overflow:     "hidden",
                      flexShrink:   0,
                      background:   "var(--bg-muted)",
                      border:       "1px solid var(--border-base)",
                    }}
                  >
                    {server.icon_url ? (
                      <Image
                        src={server.icon_url}
                        alt={server.name}
                        width={32}
                        height={32}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <span
                        style={{
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          width:          "100%",
                          height:         "100%",
                          fontFamily:     "var(--font-ui)",
                          fontSize:       "var(--text-xs)",
                          fontWeight:     500,
                          color:          "var(--text-tertiary)",
                        }}
                      >
                        {server.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>

                  {/* Name */}
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", color: isActive ? "var(--text-accent)" : "var(--text-primary)", fontWeight: isActive ? 500 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {server.name}
                  </span>

                  {isActive && (
                    <span style={{ color: "var(--text-accent)", fontSize: "12px", flexShrink: 0 }}>✓</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </ModalBody>
    </Modal>
  )
}