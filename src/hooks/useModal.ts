"use client"

/**
 * src/hooks/useModal.ts
 *
 * Typed generic modal state management.
 * Page components never hold modal state directly — they use this hook.
 * Prevents untyped prop drilling into modals.
 *
 * Usage:
 *   const banModal = useModal<BanRow>()
 *
 *   // Open with data
 *   banModal.open(banRow)
 *
 *   // In JSX
 *   <BanDetailModal
 *     isOpen={banModal.isOpen}
 *     data={banModal.data}
 *     onClose={banModal.close}
 *   />
 *
 * For modals that don't need data (confirm dialogs, create forms):
 *   const confirmModal = useModal()
 *   confirmModal.open()  // data will be undefined
 */

import { useState, useCallback } from "react"

interface UseModalReturn<T> {
  isOpen: boolean
  data:   T | null
  open:   (data?: T) => void
  close:  () => void
  /** Replace the current modal data without closing/reopening */
  update: (data: T) => void
}

export function useModal<T = undefined>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [data,   setData]   = useState<T | null>(null)

  const open = useCallback((payload?: T) => {
    setData(payload ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // Delay clearing data so the exit animation can finish before
    // the modal content unmounts or goes blank mid-animation.
    setTimeout(() => setData(null), 250)
  }, [])

  const update = useCallback((payload: T) => {
    setData(payload)
  }, [])

  return { isOpen, data, open, close, update }
}

// ─── Confirm modal specialisation ─────────────────────────────────────────────

export interface ConfirmModalData {
  title:        string
  description:  string
  confirmLabel?: string
  cancelLabel?:  string
  /** Makes the confirm button use the destructive (red) variant */
  destructive?:  boolean
  onConfirm:    () => void | Promise<void>
}

/**
 * Convenience wrapper for the ConfirmModal pattern.
 *
 * Usage:
 *   const confirm = useConfirmModal()
 *
 *   confirm.open({
 *     title:       "Lift ban?",
 *     description: "This will remove the ban from both Axolix and ERLC.",
 *     destructive: false,
 *     onConfirm:   () => liftBan(ban.id),
 *   })
 */
export function useConfirmModal() {
  return useModal<ConfirmModalData>()
}
