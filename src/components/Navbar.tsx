"use client"

/**
 * src/components/Navbar.tsx
 *
 * Top navigation bar for all protected pages.
 * Responsibilities:
 *   - Logo + nav links (reads usePermissions for conditional links)
 *   - SearchBar slot (collapsed to icon on small screens)
 *   - Avatar dropdown (theme picker, server switcher, logout)
 *   - Notification bell with unread count badge
 *
 * Reads: useTheme, useServer, usePermissions, useModal.
 * Does NOT manage search state — SearchBar owns that.
 */

import { useState }               from "react"
import Link                       from "next/link"
import Image                      from "next/image"
import { useServer }              from "@/hooks/useServer"
import { usePermissions }         from "@/hooks/usePermissions"
import { useModal }               from "@/hooks/useModal"
import { SearchBar }              from "@/components/SearchBar"
import { ThemePicker }            from "@/components/ThemePicker"
import { Avatar }                 from "@/components/Avatar"
import { ServerSelectModal }      from "@/components/modals/ServerSelectModal"
import { ROUTES, DISCORD_SUPPORT_URL } from "@/lib/utils/constants"
import type { SessionUser }        from "@/types/auth"

interface NavbarProps {
  user: SessionUser
}

export function Navbar({ user }: NavbarProps) {
  const { activeServer, activeServerId } = useServer()
  const { can, isStaff }                 = usePermissions()
  const serverModal                      = useModal()

  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const [themeOpen,    setThemeOpen]      = useState(false)
  const [searchOpen,   setSearchOpen]     = useState(false)

  const serverId = activeServerId

  return (
    <>
      <header
        style={{
          position:     "sticky",
          top:          0,
          zIndex:       "var(--z-sticky)",
          height:       "52px",
          display:      "flex",
          alignItems:   "center",
          gap:          "var(--space-4)",
          padding:      "0 var(--space-6)",
          background:   "var(--bg-surface)",
          borderBottom: "1px solid var(--border-base)",
          flexShrink:   0,
        }}
      >
        {/* Logo */}
        <Link
          href={ROUTES.dashboard}
          style={{
            fontFamily:  "var(--font-ui)",
            fontSize:    "var(--text-md)",
            fontWeight:  600,
            color:       "var(--text-primary)",
            textDecoration: "none",
            flexShrink:  0,
            letterSpacing: "-0.01em",
          }}
        >
          Axolix
        </Link>

        {/* Server name / switcher button */}
        {activeServer && (
          <>
            <span style={{ color: "var(--border-strong)", fontSize: "18px", flexShrink: 0, userSelect: "none" }}>
              /
            </span>
            <button
              onClick={() => serverModal.open()}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-2)",
                background:   "transparent",
                border:       "none",
                cursor:       "pointer",
                padding:      "var(--space-1) var(--space-2)",
                borderRadius: "var(--radius-md)",
                transition:   "background var(--dur-fast) var(--ease-out)",
                flexShrink:   0,
                maxWidth:     "160px",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              {activeServer.icon_url && (
                <Image
                  src={activeServer.icon_url}
                  alt={activeServer.name}
                  width={18}
                  height={18}
                  style={{ borderRadius: "var(--radius-sm)", flexShrink: 0 }}
                />
              )}
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeServer.name}
              </span>
              <span style={{ color: "var(--text-tertiary)", fontSize: "10px", flexShrink: 0 }}>▾</span>
            </button>
          </>
        )}

        {/* Nav links — only shown when inside a server */}
        {serverId && isStaff && (
          <nav
            aria-label="Staff navigation"
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        "var(--space-1)",
              flexShrink: 0,
            }}
          >
            <NavLink href={ROUTES.shifts(serverId)}   label="Shifts" />
            {can("manage_bans")   && <NavLink href={ROUTES.bans(serverId)}    label="Bans" />}
            {can("access_cad")    && <NavLink href={ROUTES.cad(serverId)}     label="CAD" />}
            {can("view_analytics") && <NavLink href={ROUTES.staff(serverId)}  label="Staff" />}
          </nav>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search — icon that expands or always visible */}
        <div style={{ width: searchOpen ? "240px" : "auto", transition: "width var(--dur-base) var(--ease-out)" }}>
          {searchOpen ? (
            <SearchBar
              context="global"
              placeholder="Search…"
              autoFocus
            />
          ) : (
            <button
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                justifyContent:"center",
                width:        32,
                height:       32,
                borderRadius: "var(--radius-md)",
                border:       "none",
                background:   "transparent",
                color:        "var(--text-tertiary)",
                cursor:       "pointer",
                fontSize:     "16px",
                transition:   "background var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
            >
              ⌕
            </button>
          )}
        </div>

        {/* Support link */}
        <a
          href={DISCORD_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join support Discord"
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            justifyContent:"center",
            width:        32,
            height:       32,
            borderRadius: "var(--radius-md)",
            color:        "var(--text-tertiary)",
            fontSize:     "14px",
            textDecoration:"none",
            transition:   "color var(--dur-fast) var(--ease-out)",
            flexShrink:   0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)" }}
        >
          ?
        </a>

        {/* Avatar dropdown */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen((p) => !p)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, borderRadius: "var(--radius-full)" }}
          >
            <Avatar src={user.avatarUrl} username={user.discordUsername} size="sm" />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => { setDropdownOpen(false); setThemeOpen(false) }}
                style={{ position: "fixed", inset: 0, zIndex: "var(--z-dropdown)" }}
              />

              {/* Dropdown panel */}
              <div
                style={{
                  position:     "absolute",
                  top:          "calc(100% + var(--space-2))",
                  right:        0,
                  zIndex:       "calc(var(--z-dropdown) + 1)",
                  minWidth:     "220px",
                  background:   "var(--bg-elevated)",
                  border:       "1px solid var(--border-base)",
                  borderRadius: "var(--radius-xl)",
                  padding:      "var(--space-2)",
                  animation:    "axolix-slide-up var(--dur-enter) var(--ease-spring)",
                  boxShadow:    "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                {/* User info */}
                <div style={{ padding: "var(--space-2) var(--space-3) var(--space-3)", borderBottom: "1px solid var(--border-base)", marginBottom: "var(--space-1)" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                    {user.discordUsername}
                  </p>
                  {user.robloxUsername && (
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      {user.robloxUsername}
                    </p>
                  )}
                </div>

                {/* Switch server */}
                <DropdownItem
                  label="Switch server"
                  onClick={() => { serverModal.open(); setDropdownOpen(false) }}
                />

                {/* Theme picker toggle */}
                <DropdownItem
                  label={themeOpen ? "Hide themes" : "Theme"}
                  onClick={() => setThemeOpen((p) => !p)}
                />

                {themeOpen && (
                  <div style={{ padding: "var(--space-2) var(--space-3)", borderTop: "1px solid var(--border-base)", marginTop: "var(--space-1)" }}>
                    <ThemePicker />
                  </div>
                )}

                {/* Logout */}
                <div style={{ borderTop: "1px solid var(--border-base)", marginTop: "var(--space-1)", paddingTop: "var(--space-1)" }}>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      style={{
                        display:      "flex",
                        alignItems:   "center",
                        width:        "100%",
                        padding:      "var(--space-2) var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border:       "none",
                        background:   "transparent",
                        cursor:       "pointer",
                        fontFamily:   "var(--font-ui)",
                        fontSize:     "var(--text-sm)",
                        color:        "var(--status-red)",
                        textAlign:    "left",
                        transition:   "background var(--dur-fast) var(--ease-out)",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Modals */}
      <ServerSelectModal isOpen={serverModal.isOpen} onClose={serverModal.close} />
    </>
  )
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        padding:      "var(--space-1) var(--space-3)",
        borderRadius: "var(--radius-md)",
        fontFamily:   "var(--font-ui)",
        fontSize:     "var(--text-sm)",
        fontWeight:   400,
        color:        "var(--text-secondary)",
        textDecoration: "none",
        transition:   "color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
        whiteSpace:   "nowrap",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = "var(--text-primary)"
        el.style.background = "var(--bg-muted)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = "var(--text-secondary)"
        el.style.background = "transparent"
      }}
    >
      {label}
    </Link>
  )
}

function DropdownItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:      "flex",
        alignItems:   "center",
        width:        "100%",
        padding:      "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        border:       "none",
        background:   "transparent",
        cursor:       "pointer",
        fontFamily:   "var(--font-ui)",
        fontSize:     "var(--text-sm)",
        color:        "var(--text-secondary)",
        textAlign:    "left",
        transition:   "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "var(--bg-muted)"
        el.style.color = "var(--text-primary)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = "transparent"
        el.style.color = "var(--text-secondary)"
      }}
    >
      {label}
    </button>
  )
}
