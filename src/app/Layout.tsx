/**
 * src/app/layout.tsx
 *
 * Root layout — wraps every page in the app.
 *
 * Responsibilities:
 *   1. Inline theme script in <head> — reads axolix_theme cookie and sets
 *      data-theme on <html> BEFORE React hydrates, preventing theme flash.
 *   2. Google Fonts preconnect + link tags (the @import in index.css handles
 *      the actual load, these preconnects speed it up).
 *   3. Imports the single global stylesheet.
 *   4. Renders the Toaster for toast notifications.
 *   5. Sets base HTML metadata.
 */

import type { Metadata, Viewport } from "next"
import { getThemeCookie } from "@/lib/auth/session"
import { Toaster } from "@/components/Toaster"
import "@/styles/index.css"

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  "Axolix",
    template: "%s · Axolix",
  },
  description:
    "The management platform for ERLC Discord communities — shifts, bans, CAD, and analytics in one place.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://axolix.com",
  ),
  openGraph: {
    type:      "website",
    siteName:  "Axolix",
    title:     "Axolix",
    description:
      "The management platform for ERLC Discord communities.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#0e0f13",
}

// ─── Theme script ─────────────────────────────────────────────────────────────
//
// Runs synchronously before any CSS or React paint.
// Reads the axolix_theme cookie (SameSite=Lax so it's available here),
// falls back to "dark", and sets data-theme on <html>.
//
// Must be a plain string — no imports, no module scope.
// Keep this tiny — it blocks rendering until it completes.

const THEME_SCRIPT = `
(function(){
  try {
    var cookie = document.cookie.split(';').find(function(c){
      return c.trim().startsWith('axolix_theme=');
    });
    var theme = cookie ? cookie.trim().split('=')[1] : 'dark';
    var valid = ['dark','midnight','dusk','abyss','forest','ember','obsidian','void',
                 'light','arctic','parchment','sage','blossom','frost','pure'];
    document.documentElement.setAttribute(
      'data-theme',
      valid.indexOf(theme) !== -1 ? theme : 'dark'
    );
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim()

// ─── Layout ───────────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read the theme server-side so the SSR HTML already has the right data-theme.
  // The inline script above is a belt-and-suspenders fallback for edge cases
  // where the cookie read differs between server and client.
  const theme = await getThemeCookie()

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        {/* Theme script — must be first child of <head>, before any stylesheets */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />

        {/* Google Fonts preconnect — speeds up the @import in index.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
