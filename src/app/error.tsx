"use client"

/**
 * src/app/error.tsx
 *
 * Global error boundary — catches unhandled errors in the route tree.
 * Must be a Client Component (Next.js requirement for error boundaries).
 *
 * Shows a recoverable error state with a retry button and a link to the
 * Discord support server. Does not expose stack traces to users.
 */

import { useEffect } from "react"
import Link from "next/link"
import { ROUTES, DISCORD_SUPPORT_URL } from "@/lib/utils/constants"

interface ErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to the system log pipeline in production.
    // In development, the error is already surfaced in the console by Next.js.
    if (process.env.NODE_ENV === "production") {
      fetch("/api/analytics/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: [{
            page:      window.location.pathname,
            eventType: "view",
            metadata: {
              type:    "client_error",
              message: error.message,
              digest:  error.digest ?? null,
            },
          }],
        }),
      }).catch(() => {})
    }
  }, [error])

  return (
    <main
      style={{
        minHeight:       "100dvh",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             "var(--space-6)",
        padding:         "var(--space-8)",
        textAlign:       "center",
        backgroundColor: "var(--bg-base)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize:   "var(--text-stat-lg)",
          fontWeight: 700,
          color:      "var(--status-red)",
          lineHeight: 1,
        }}
      >
        500
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h1
          style={{
            fontSize:   "var(--text-xl)",
            fontWeight: 600,
            color:      "var(--text-primary)",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: "var(--text-base)",
            color:    "var(--text-secondary)",
            maxWidth: "400px",
          }}
        >
          An unexpected error occurred. If this keeps happening, let us know in
          our Discord server.
        </p>

        {/* Show digest in production for support reference, never the full message */}
        {error.digest && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize:   "var(--text-xs)",
              color:      "var(--text-tertiary)",
              marginTop:  "var(--space-1)",
            }}
          >
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div
        style={{
          display:        "flex",
          gap:            "var(--space-3)",
          flexWrap:       "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={reset}
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            padding:         "var(--space-2) var(--space-5)",
            backgroundColor: "var(--accent)",
            color:           "#fff",
            border:          "none",
            borderRadius:    "var(--radius-lg)",
            fontSize:        "var(--text-sm)",
            fontWeight:      500,
            cursor:          "pointer",
          }}
        >
          Try again
        </button>

        <Link
          href={ROUTES.home}
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
          Join Discord
        </a>
      </div>
    </main>
  )
}
