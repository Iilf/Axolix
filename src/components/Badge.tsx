"use client"

/**
 * src/components/Badge.tsx
 *
 * Compact label chip used for roles, statuses, tags, and counts.
 * All colours derived from CSS status/accent tokens — no hardcoded hex.
 *
 * Variants:
 *   default  — accent-dim background, accent text
 *   success  — status-green tinted
 *   warning  — status-amber tinted
 *   danger   — status-red tinted
 *   muted    — bg-muted, secondary text (for neutral/inactive states)
 *   outline  — transparent fill, border only
 *
 * Sizes: sm | md
 */

import { cn } from "@/lib/utils/cn"

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "outline"

interface BadgeProps {
  children:   React.ReactNode
  variant?:   BadgeVariant
  size?:      "sm" | "md"
  dot?:       boolean   // prepend a status dot
  className?: string
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--accent-dim)",
    color:      "var(--text-accent)",
    border:     "1px solid transparent",
  },
  success: {
    background: "color-mix(in srgb, var(--status-green) 15%, transparent)",
    color:      "var(--status-green)",
    border:     "1px solid transparent",
  },
  warning: {
    background: "color-mix(in srgb, var(--status-amber) 15%, transparent)",
    color:      "var(--status-amber)",
    border:     "1px solid transparent",
  },
  danger: {
    background: "color-mix(in srgb, var(--status-red) 15%, transparent)",
    color:      "var(--status-red)",
    border:     "1px solid transparent",
  },
  muted: {
    background: "var(--bg-muted)",
    color:      "var(--text-secondary)",
    border:     "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color:      "var(--text-secondary)",
    border:     "1px solid var(--border-base)",
  },
}

const DOT_COLOR: Record<BadgeVariant, string> = {
  default: "var(--accent)",
  success: "var(--status-green)",
  warning: "var(--status-amber)",
  danger:  "var(--status-red)",
  muted:   "var(--text-tertiary)",
  outline: "var(--text-tertiary)",
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(className)}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        gap:           "4px",
        padding:       size === "sm" ? "2px 6px" : "3px 8px",
        borderRadius:  "var(--radius-full)",
        fontFamily:    "var(--font-ui)",
        fontSize:      size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
        fontWeight:    500,
        lineHeight:    "var(--leading-ui)",
        whiteSpace:    "nowrap",
        userSelect:    "none",
        ...VARIANT_STYLES[variant],
      }}
    >
      {dot && (
        <span
          aria-hidden
          style={{
            display:      "inline-block",
            width:        5,
            height:       5,
            borderRadius: "var(--radius-full)",
            background:   DOT_COLOR[variant],
            flexShrink:   0,
          }}
        />
      )}
      {children}
    </span>
  )
}