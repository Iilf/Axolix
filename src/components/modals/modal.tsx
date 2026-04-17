"use client"

/**
 * src/components/modals/Modal.tsx
 *
 * Base modal wrapper. Handles:
 *   - Focus trap (Tab / Shift+Tab cycle stays inside)
 *   - Escape to close
 *   - Backdrop click to close
 *   - Spring enter / ease-in exit animation
 *   - Body scroll lock while open
 *   - Portal rendering via React.createPortal
 *
 * All other modals (BanDetailModal, ConfirmModal, etc.) compose this.
 * Never build modal structure outside of this component.
 *
 * Sizes: sm (400px) | md (560px) | lg (720px) | xl (900px) | full (100%)
 */

import { useEffect, useRef, useCallback } from "react"
import { createPortal }                   from "react-dom"
import { cn }                             from "@/lib/utils/cn"

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full"

const SIZE_MAP: Record<ModalSize, string> = {
  sm:   "400px",
  md:   "560px",
  lg:   "720px",
  xl:   "900px",
  full: "calc(100vw - 48px)",
}

interface ModalProps {
  isOpen:        boolean
  onClose:       () => void
  children:      React.ReactNode
  size?:         ModalSize
  title?:        string
  /** Prevent close on backdrop click */
  persistent?:   boolean
  className?:    string
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
  title,
  persistent,
  className,
}: ModalProps) {
  const overlayRef  = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll and save focus target on open
  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = "hidden"
      // Move focus into the modal on the next frame
      requestAnimationFrame(() => {
        const first = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        first?.focus()
      })
    } else {
      document.body.style.overflow = ""
      prevFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  // Focus trap
  const trapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !contentRef.current) return
    const focusable = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  if (!isOpen) return null

  const modal = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={trapFocus}
      onClick={(e) => {
        if (!persistent && e.target === overlayRef.current) onClose()
      }}
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          "var(--z-modal)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "var(--space-6)",
        background:      "rgba(0, 0, 0, 0.6)",
        backdropFilter:  "blur(4px)",
        animation:       "axolix-fade-in var(--dur-fast) var(--ease-out)",
      }}
    >
      <div
        ref={contentRef}
        className={cn(className)}
        style={{
          position:     "relative",
          width:        "100%",
          maxWidth:     SIZE_MAP[size],
          maxHeight:    "calc(100dvh - 48px)",
          display:      "flex",
          flexDirection:"column",
          background:   "var(--bg-elevated)",
          border:       "1px solid var(--border-base)",
          borderRadius: "var(--radius-2xl)",
          overflowY:    "auto",
          animation:    "axolix-scale-in var(--dur-enter) var(--ease-spring)",
        }}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ─── Subcomponents — compose inside Modal ─────────────────────────────────────

export function ModalHeader({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose?: () => void
}) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            "var(--space-4)",
        padding:        "var(--space-5) var(--space-6)",
        borderBottom:   "1px solid var(--border-base)",
        flexShrink:     0,
      }}
    >
      <div style={{ fontFamily: "var(--font-ui)", fontSize: "var(--text-md)", fontWeight: 500, color: "var(--text-primary)" }}>
        {children}
      </div>
      {onClose && (
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           28,
            height:          28,
            borderRadius:    "var(--radius-md)",
            border:          "none",
            background:      "transparent",
            color:           "var(--text-tertiary)",
            cursor:          "pointer",
            fontSize:        "16px",
            flexShrink:      0,
            transition:      "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = "var(--bg-muted)"
            el.style.color      = "var(--text-primary)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = "transparent"
            el.style.color      = "var(--text-tertiary)"
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(className)}
      style={{
        padding:   "var(--space-6)",
        overflowY: "auto",
        flex:      1,
      }}
    >
      {children}
    </div>
  )
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "flex-end",
        gap:            "var(--space-3)",
        padding:        "var(--space-4) var(--space-6)",
        borderTop:      "1px solid var(--border-base)",
        flexShrink:     0,
      }}
    >
      {children}
    </div>
  )
}