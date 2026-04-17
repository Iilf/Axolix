"use client"

/**
 * src/components/DataTable.tsx
 *
 * Generic table used by every list view in the staff panel.
 * Supports: column definitions with optional sort, list/card toggle,
 * skeleton loading rows, row click handler, and empty state.
 *
 * This is the most critical shared component — lock the column API
 * before building any staff panel feature.
 *
 * Column definition shape:
 *   key       — unique identifier, used as the sort key
 *   header    — column header label
 *   render    — (row) => ReactNode — how to render the cell
 *   width?    — CSS width string e.g. "120px", "1fr"
 *   sortable? — whether this column can be sorted
 *   align?    — "left" | "right" | "center"
 */

import { useState } from "react"
import { Pagination } from "@/components/Pagination"
import { cn } from "@/lib/utils/cn"

export interface ColumnDef<T> {
  key:       string
  header:    string
  render:    (row: T) => React.ReactNode
  width?:    string
  sortable?: boolean
  align?:    "left" | "right" | "center"
}

export type SortDirection = "asc" | "desc"

export interface SortState {
  key:       string
  direction: SortDirection
}

export type ViewMode = "list" | "card"

interface DataTableProps<T extends { id: string }> {
  columns:      ColumnDef<T>[]
  data:         T[]
  isLoading?:   boolean
  /** Render a card representation of a row for card view */
  renderCard?:  (row: T) => React.ReactNode
  onRowClick?:  (row: T) => void
  emptyState?:  React.ReactNode
  /** Controlled sort — parent manages sort state */
  sort?:        SortState
  onSort?:      (sort: SortState) => void
  /** Pagination */
  page?:        number
  pageSize?:    number
  total?:       number
  onPage?:      (page: number) => void
  /** Show list/card toggle — requires renderCard */
  showViewToggle?: boolean
  className?:   string
}

const SKELETON_ROWS = 8

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  renderCard,
  onRowClick,
  emptyState,
  sort,
  onSort,
  page = 1,
  pageSize = 25,
  total,
  onPage,
  showViewToggle,
  className,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  function handleSort(key: string) {
    if (!onSort) return
    onSort({
      key,
      direction: sort?.key === key && sort.direction === "asc" ? "desc" : "asc",
    })
  }

  const isEmpty = !isLoading && data.length === 0

  return (
    <div className={cn(className)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

      {/* Toolbar — view toggle */}
      {showViewToggle && renderCard && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            role="group"
            aria-label="View mode"
            style={{
              display:       "flex",
              background:    "var(--bg-surface)",
              border:        "1px solid var(--border-base)",
              borderRadius:  "var(--radius-lg)",
              padding:       "2px",
              gap:           "2px",
            }}
          >
            {(["list", "card"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                aria-pressed={viewMode === mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding:      "4px 10px",
                  borderRadius: "var(--radius-md)",
                  border:       "none",
                  background:   viewMode === mode ? "var(--accent-dim)" : "transparent",
                  color:        viewMode === mode ? "var(--text-accent)" : "var(--text-secondary)",
                  fontFamily:   "var(--font-ui)",
                  fontSize:     "var(--text-sm)",
                  fontWeight:   viewMode === mode ? 500 : 400,
                  cursor:       "pointer",
                  transition:   "background var(--dur-fast) var(--ease-out)",
                }}
              >
                {mode === "list" ? "List" : "Cards"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card view */}
      {viewMode === "card" && renderCard && !isLoading && (
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap:                 "var(--space-4)",
          }}
        >
          {isEmpty
            ? (emptyState ?? <DefaultEmpty />)
            : data.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {renderCard(row)}
                </div>
              ))}
        </div>
      )}

      {/* List / table view */}
      {(viewMode === "list" || !renderCard) && (
        <div
          style={{
            background:   "var(--bg-surface)",
            border:       "1px solid var(--border-base)",
            borderRadius: "var(--radius-xl)",
            overflow:     "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width:          "100%",
                borderCollapse: "collapse",
                fontFamily:     "var(--font-ui)",
              }}
            >
              {/* Head */}
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-base)",
                    background:   "var(--bg-muted)",
                  }}
                >
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => col.sortable && handleSort(col.key)}
                      style={{
                        padding:       "var(--space-3) var(--space-4)",
                        textAlign:     col.align ?? "left",
                        fontFamily:    "var(--font-ui)",
                        fontSize:      "var(--text-xs)",
                        fontWeight:    500,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color:         "var(--text-tertiary)",
                        width:         col.width,
                        cursor:        col.sortable ? "pointer" : "default",
                        userSelect:    "none",
                        whiteSpace:    "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {col.header}
                        {col.sortable && (
                          <span style={{ opacity: sort?.key === col.key ? 1 : 0.3, fontSize: "10px" }}>
                            {sort?.key === col.key && sort.direction === "desc" ? "↓" : "↑"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {isLoading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                      <SkeletonRow key={i} columns={columns.length} />
                    ))
                  : isEmpty
                  ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ padding: "var(--space-12)", textAlign: "center" }}
                      >
                        {emptyState ?? <DefaultEmpty />}
                      </td>
                    </tr>
                  )
                  : data.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick?.(row)}
                      style={{
                        borderTop:   idx === 0 ? "none" : "1px solid var(--border-base)",
                        cursor:      onRowClick ? "pointer" : "default",
                        transition:  "background var(--dur-fast) var(--ease-out)",
                        animation:   `axolix-fade-in var(--dur-fast) var(--ease-out) ${idx * 20}ms both`,
                      }}
                      onMouseEnter={(e) => {
                        if (onRowClick) (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent"
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding:   "var(--space-3) var(--space-4)",
                            textAlign: col.align ?? "left",
                            fontSize:  "var(--text-sm)",
                            color:     "var(--text-primary)",
                            verticalAlign: "middle",
                          }}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {onPage && total !== undefined && total > pageSize && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPage={onPage}
        />
      )}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr style={{ borderTop: "1px solid var(--border-base)", opacity: 0.6 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: "var(--space-3) var(--space-4)" }}>
          <span
            style={{
              display:      "block",
              height:       "12px",
              width:        i === 0 ? "60%" : "40%",
              borderRadius: "var(--radius-sm)",
              background:   "var(--bg-muted)",
              animation:    "axolix-status-pulse 1.5s ease-in-out infinite",
            }}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Default empty state ──────────────────────────────────────────────────────

function DefaultEmpty() {
  return (
    <p style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
      No results found.
    </p>
  )
}