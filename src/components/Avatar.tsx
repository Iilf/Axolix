"use client"

/**
 * src/components/Avatar.tsx
 *
 * User avatar with initials fallback and optional StatusDot overlay.
 * Consumes only CSS variables — no hardcoded colours.
 *
 * Sizes: sm (24px) | md (32px) | lg (40px) | xl (56px)
 */

import Image from "next/image"
import { StatusDot, type StatusColor } from "@/components/StatusDot"
import { cn } from "@/lib/utils/cn"

const SIZE_PX = { sm: 24, md: 32, lg: 40, xl: 56 } as const
type AvatarSize = keyof typeof SIZE_PX

interface AvatarProps {
  src?:        string | null
  username?:   string | null
  size?:       AvatarSize
  status?:     StatusColor
  pulse?:      boolean
  className?:  string
}

export function Avatar({
  src,
  username,
  size = "md",
  status,
  pulse,
  className,
}: AvatarProps) {
  const px      = SIZE_PX[size]
  const initials = getInitials(username)

  return (
    <span
      className={cn("avatar-root", className)}
      style={{
        position:     "relative",
        display:      "inline-flex",
        flexShrink:   0,
        width:        px,
        height:       px,
        borderRadius: "var(--radius-full)",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={username ?? "User avatar"}
          width={px}
          height={px}
          style={{
            borderRadius:    "var(--radius-full)",
            objectFit:       "cover",
            width:           "100%",
            height:          "100%",
            border:          "1px solid var(--border-base)",
          }}
        />
      ) : (
        <span
          aria-label={username ?? "User"}
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           "100%",
            height:          "100%",
            borderRadius:    "var(--radius-full)",
            background:      "var(--accent-dim)",
            border:          "1px solid var(--border-base)",
            fontFamily:      "var(--font-ui)",
            fontSize:        px <= 24 ? "9px" : px <= 32 ? "11px" : "13px",
            fontWeight:      500,
            color:           "var(--text-accent)",
            lineHeight:      1,
            userSelect:      "none",
          }}
        >
          {initials}
        </span>
      )}

      {status && (
        <span
          style={{
            position: "absolute",
            bottom:   0,
            right:    0,
          }}
        >
          <StatusDot color={status} pulse={pulse} size={size === "sm" ? "sm" : "md"} />
        </span>
      )}
    </span>
  )
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}