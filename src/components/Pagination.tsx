"use client"

/**
 * src/components/Pagination.tsx
 *
 * Generic pagination control used by DataTable and any paginated list.
 * Stateless — parent owns the page number and passes setPage down.
 */

import { cn } from "@/lib/utils/cn"

interface PaginationProps {
  page:      number
  pageSize:  number
  total:     number
  onPage:    (page: number) => void
  className?: string
}

export function Pagination({ page, pageSize, total, onPage, className }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, total)

  const pages = getPageNumbers(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn(className)}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            "var(--space-4)",
        flexWrap:       "wrap",
      }}
    >
      {/* Count */}
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize:   "var(--text-sm)",
          color:      "var(--text-tertiary)",
        }}
      >
        {start}–{end} of {total}
      </span>

      {/* Page buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
        <PageBtn
          label="←"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria="Previous page"
        />

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                padding:    "0 var(--space-1)",
                color:      "var(--text-tertiary)",
                fontSize:   "var(--text-sm)",
                userSelect: "none",
              }}
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              label={String(p)}
              onClick={() => onPage(p as number)}
              active={p === page}
              aria={`Page ${p}`}
            />
          ),
        )}

        <PageBtn
          label="→"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria="Next page"
        />
      </div>
    </nav>
  )
}

// ─── Internal button ──────────────────────────────────────────────────────────

interface PageBtnProps {
  label:    string
  onClick:  () => void
  active?:  boolean
  disabled?: boolean
  aria:     string
}

function PageBtn({ label, onClick, active, disabled, aria }: PageBtnProps) {
  return (
    <button
      aria-label={aria}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      disabled={disabled}
      style={{
        display:         "inline-flex",
        alignItems:      "center",
        justifyContent:  "center",
        minWidth:        "28px",
        height:          "28px",
        padding:         "0 var(--space-2)",
        borderRadius:    "var(--radius-md)",
        border:          active ? "1px solid var(--accent)" : "1px solid transparent",
        background:      active ? "var(--accent-dim)" : "transparent",
        color:           active ? "var(--text-accent)" : disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
        fontFamily:      "var(--font-ui)",
        fontSize:        "var(--text-sm)",
        fontWeight:      active ? 500 : 400,
        cursor:          disabled ? "not-allowed" : "pointer",
        opacity:         disabled ? 0.4 : 1,
        transition:      "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
      }}
    >
      {label}
    </button>
  )
}

// ─── Page number logic ────────────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "…")[] = [1]

  if (current > 3)        pages.push("…")
  if (current > 2)        pages.push(current - 1)
  if (current > 1 && current < total) pages.push(current)
  if (current < total - 1) pages.push(current + 1)
  if (current < total - 2) pages.push("…")

  pages.push(total)
  return [...new Set(pages)] as (number | "…")[]
}