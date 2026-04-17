"use client"

/**
 * src/components/StatusDot.tsx
 *
 * Small coloured dot for online/duty/status indicators.
 * Used in Avatar overlays and CAD unit lists.
 *
 * Colors map to CSS status tokens so they adapt across all 15 themes.
 * Pulse animation indicates an active / live state.
 */

import { cn } from "@/lib/utils/cn"

export type StatusColor = "green" | "amber" | "red" | "gray"

const COLOR_VAR: Record<StatusColor, string> = {
  green: "var(--status-green)",
  amber: "var(--status-amber)",
  red:   "var(--status-red)",
  gray:  "var(--text-tertiary)",
}

interface StatusDotProps {
  color:      StatusColor
  pulse?:     boolean
  size?:      "sm" | "md"
  className?: string
}

export function StatusDot({ color, pulse, size = "md", className }: StatusDotProps) {
  const px = size === "sm" ? 6 : 8

  return (
    <span
      className={cn(className)}
      style={{
        position:      "relative",
        display:       "inline-flex",
        alignItems:    "center",
        justifyContent:"center",
        width:         px,
        height:        px,
        flexShrink:    0,
      }}
    >
      {/* Pulse ring — renders behind the dot */}
      {pulse && (
        <span
          aria-hidden
          style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "var(--radius-full)",
            background:   COLOR_VAR[color],
            opacity:      0.4,
            animation:    "axolix-status-pulse 2s ease-in-out infinite",
          }}
        />
      )}
      <span
        role="status"
        aria-label={color}
        style={{
          display:      "block",
          width:        px,
          height:       px,
          borderRadius: "var(--radius-full)",
          background:   COLOR_VAR[color],
          flexShrink:   0,
          position:     "relative",
          zIndex:       1,
          border:       "1.5px solid var(--bg-base)",
        }}
      />
    </span>
  )
}