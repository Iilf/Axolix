"use client"

/**
 * src/components/ThemePicker.tsx
 *
 * 15-theme colour swatch grid.
 * Used inside the Navbar avatar dropdown.
 * Calls useTheme() to switch and persist the theme.
 */

import { useTheme }                from "@/hooks/useTheme"
import { DARK_THEMES, LIGHT_THEMES } from "@/lib/utils/constraints"
import type { ThemeName }           from "@/lib/utils/constraints"

// Visual swatch colours — hardcoded because they represent specific theme identities,
// not the current theme's variables
const SWATCH: Record<ThemeName, { bg: string; accent: string }> = {
  dark:      { bg: "#0e0f13", accent: "#7c5cfc" },
  midnight:  { bg: "#060608", accent: "#8b5cf6" },
  dusk:      { bg: "#12101a", accent: "#c084fc" },
  abyss:     { bg: "#0a0e1a", accent: "#3b82f6" },
  forest:    { bg: "#0d1210", accent: "#22c55e" },
  ember:     { bg: "#130a0a", accent: "#ef4444" },
  obsidian:  { bg: "#0f0f0f", accent: "#f59e0b" },
  void:      { bg: "#0c0f14", accent: "#06b6d4" },
  light:     { bg: "#f5f5f7", accent: "#6246ea" },
  arctic:    { bg: "#e8edf5", accent: "#4f46e5" },
  parchment: { bg: "#faf7f2", accent: "#d97706" },
  sage:      { bg: "#f0faf4", accent: "#16a34a" },
  blossom:   { bg: "#fdf2f8", accent: "#db2777" },
  frost:     { bg: "#f0f7ff", accent: "#2563eb" },
  pure:      { bg: "#fefefe", accent: "#7c3aed" },
}

const THEME_LABEL: Record<ThemeName, string> = {
  dark:      "Dark",
  midnight:  "Midnight",
  dusk:      "Dusk",
  abyss:     "Abyss",
  forest:    "Forest",
  ember:     "Ember",
  obsidian:  "Obsidian",
  void:      "Void",
  light:     "Light",
  arctic:    "Arctic",
  parchment: "Parchment",
  sage:      "Sage",
  blossom:   "Blossom",
  frost:     "Frost",
  pure:      "Pure",
}

export function ThemePicker() {
  const { theme, setTheme } = useTheme()

  function renderGroup(label: string, themes: readonly ThemeName[]) {
    return (
      <div>
        <p
          style={{
            fontFamily:    "var(--font-ui)",
            fontSize:      "var(--text-xs)",
            fontWeight:    500,
            color:         "var(--text-tertiary)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom:  "var(--space-2)",
          }}
        >
          {label}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {themes.map((t) => {
            const sw      = SWATCH[t]
            const active  = t === theme
            return (
              <button
                key={t}
                title={THEME_LABEL[t]}
                aria-label={`${THEME_LABEL[t]} theme${active ? " (active)" : ""}`}
                aria-pressed={active}
                onClick={() => setTheme(t)}
                style={{
                  position:    "relative",
                  width:       28,
                  height:      28,
                  borderRadius:"var(--radius-md)",
                  border:      active
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  background:  sw.bg,
                  cursor:      "pointer",
                  padding:     0,
                  overflow:    "hidden",
                  outline:     "none",
                  transition:  "border-color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-spring)",
                  boxShadow:   active ? `0 0 0 1px ${sw.accent}` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)"
                }}
              >
                {/* Accent dot */}
                <span
                  aria-hidden
                  style={{
                    position:     "absolute",
                    bottom:       3,
                    right:        3,
                    width:        7,
                    height:       7,
                    borderRadius: "var(--radius-full)",
                    background:   sw.accent,
                  }}
                />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {renderGroup("Dark", DARK_THEMES)}
      {renderGroup("Light", LIGHT_THEMES)}
    </div>
  )
}