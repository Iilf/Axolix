/**
 * src/app/not-found.tsx
 *
 * Global 404 — rendered by Next.js when no route matches.
 * Branded, links back to home and the Discord support server.
 * No auth required — intentionally minimal.
 */

import type { Metadata } from "next"
import Link from "next/link"
import { ROUTES, DISCORD_SUPPORT_URL } from "@/lib/utils/constants"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <main
      style={{
        minHeight:      "100dvh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "var(--space-6)",
        padding:        "var(--space-8)",
        textAlign:      "center",
        backgroundColor: "var(--bg-base)",
      }}
    >
      <span
        style={{
          fontFamily:  "var(--font-mono)",
          fontSize:    "var(--text-stat-lg)",
          fontWeight:  700,
          color:       "var(--accent)",
          lineHeight:  1,
        }}
      >
        404
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h1
          style={{
            fontSize:   "var(--text-xl)",
            fontWeight: 600,
            color:      "var(--text-primary)",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "var(--text-base)",
            color:    "var(--text-secondary)",
            maxWidth: "380px",
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href={ROUTES.home}
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            padding:         "var(--space-2) var(--space-5)",
            backgroundColor: "var(--accent)",
            color:           "#fff",
            borderRadius:    "var(--radius-lg)",
            fontSize:        "var(--text-sm)",
            fontWeight:      500,
            textDecoration:  "none",
            transition:      "background-color var(--dur-fast) var(--ease-out)",
          }}
        >
          Go home
        </Link>

        <a
          href={DISCORD_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            padding:         "var(--space-2) var(--space-5)",
            backgroundColor: "var(--bg-surface)",
            color:           "var(--text-primary)",
            border:          "1px solid var(--border-base)",
            borderRadius:    "var(--radius-lg)",
            fontSize:        "var(--text-sm)",
            fontWeight:      500,
            textDecoration:  "none",
          }}
        >
          Get help on Discord
        </a>
      </div>
    </main>
  )
}
