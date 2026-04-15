"use client"

/**
 * src/hooks/useTheme.ts
 *
 * Manages the active theme — reads the axolix_theme cookie, sets data-theme
 * on <html>, and writes back to the cookie on change.
 *
 * Cookie (not localStorage) is used so the server can read the theme on SSR
 * and the inline head script can apply it before React hydrates — preventing
 * any flash of wrong theme.
 *
 * The inline script in src/app/layout.tsx handles the very first paint.
 * This hook takes over at runtime for switching.
 */

import { useState, useEffect, useCallback } from "react"
import { ALL_THEMES, DEFAULT_THEME, COOKIE_THEME, COOKIE_THEME_MAX_AGE } from "@/lib/utils/constants"
import type { ThemeName } from "@/lib/utils/constants"

interface UseThemeReturn {
  theme:     ThemeName
  setTheme:  (theme: ThemeName) => void
  isDark:    boolean
  themes:    typeof ALL_THEMES
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    // Read from the data-theme attribute already set by the head script.
    // Falls back to the default if called before hydration (SSR).
    if (typeof document === "undefined") return DEFAULT_THEME
    const current = document.documentElement.getAttribute("data-theme")
    return (ALL_THEMES as readonly string[]).includes(current ?? "")
      ? (current as ThemeName)
      : DEFAULT_THEME
  })

  // Sync state if the attribute was set externally (e.g. head script)
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme")
    if (current && current !== theme) {
      setThemeState(current as ThemeName)
    }
  }, [])

  const setTheme = useCallback((next: ThemeName) => {
    if (!(ALL_THEMES as readonly string[]).includes(next)) return

    // 1. Update the DOM immediately — no flash
    document.documentElement.setAttribute("data-theme", next)

    // 2. Persist to cookie so SSR and the head script read the right value
    document.cookie = [
      `${COOKIE_THEME}=${next}`,
      `max-age=${COOKIE_THEME_MAX_AGE}`,
      "path=/",
      "samesite=lax",
      "secure",
    ].join("; ")

    // 3. Update React state
    setThemeState(next)
  }, [])

  const isDark = theme === "dark"     ||
                 theme === "midnight" ||
                 theme === "dusk"     ||
                 theme === "abyss"    ||
                 theme === "forest"   ||
                 theme === "ember"    ||
                 theme === "obsidian" ||
                 theme === "void"

  return { theme, setTheme, isDark, themes: ALL_THEMES }
}
